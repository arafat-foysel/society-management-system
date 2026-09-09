from django.db import migrations


def remove_old_contribution_fields(apps, schema_editor):
    """
    The effective_from column was already created during
    the previous migration attempt.

    This migration only needs to remove the old year/month
    columns and the old unique constraint.
    """

    schema_editor.remove_constraint(
        apps.get_model(
            "contributions",
            "MonthlyContribution",
        ),
        apps.get_model(
            "contributions",
            "MonthlyContribution"
        )._meta.constraints[0]
    )


class Migration(migrations.Migration):

    dependencies = [
        ("contributions", "0001_initial"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[],
            state_operations=[],
        ),
    ]