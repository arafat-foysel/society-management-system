from django.db import migrations, models


def align_contribution_database(apps, schema_editor):
    """
    Align the physical database with the current MonthlyContribution model.

    Fresh databases have the old year/month structure from 0001.
    Existing databases may already have effective_from.
    """
    table_name = "contributions_monthlycontribution"
    connection = schema_editor.connection

    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = %s
            """,
            [table_name],
        )
        columns = {row[0] for row in cursor.fetchall()}

    has_effective_from = "effective_from" in columns
    has_year = "year" in columns
    has_month = "month" in columns

    if not has_effective_from:
        # Add the new column temporarily as nullable so existing rows
        # can be populated from the old year/month fields.
        schema_editor.execute(
            """
            ALTER TABLE contributions_monthlycontribution
            ADD COLUMN effective_from DATE NULL
            """
        )

        if has_year and has_month:
            schema_editor.execute(
                """
                UPDATE contributions_monthlycontribution
                SET effective_from = STR_TO_DATE(
                    CONCAT(year, '-', LPAD(month, 2, '0'), '-01'),
                    '%%Y-%%m-%%d'
                )
                """
            )

        schema_editor.execute(
            """
            ALTER TABLE contributions_monthlycontribution
            MODIFY COLUMN effective_from DATE NOT NULL
            """
        )

    # Remove the old unique constraint if the old structure still exists.
    if has_year and has_month:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT INDEX_NAME
                FROM INFORMATION_SCHEMA.STATISTICS
                WHERE TABLE_SCHEMA = DATABASE()
                  AND TABLE_NAME = %s
                  AND INDEX_NAME = 'unique_contribution_year_month'
                """,
                [table_name],
            )
            constraint_exists = cursor.fetchone() is not None

        if constraint_exists:
            schema_editor.execute(
                """
                ALTER TABLE contributions_monthlycontribution
                DROP INDEX unique_contribution_year_month
                """
            )

        schema_editor.execute(
            """
            ALTER TABLE contributions_monthlycontribution
            DROP COLUMN year,
            DROP COLUMN month
            """
        )


class Migration(migrations.Migration):

    dependencies = [
        ("contributions", "0002_auto_20260906_2103"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(
                    align_contribution_database,
                    reverse_code=migrations.RunPython.noop,
                ),
            ],
            state_operations=[
                migrations.RemoveConstraint(
                    model_name="monthlycontribution",
                    name="unique_contribution_year_month",
                ),
                migrations.RemoveField(
                    model_name="monthlycontribution",
                    name="year",
                ),
                migrations.RemoveField(
                    model_name="monthlycontribution",
                    name="month",
                ),
                migrations.AddField(
                    model_name="monthlycontribution",
                    name="effective_from",
                    field=models.DateField(),
                ),
            ],
        ),
    ]