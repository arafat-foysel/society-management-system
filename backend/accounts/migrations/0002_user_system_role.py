from django.db import migrations, models


def set_existing_user_roles(apps, schema_editor):
    User = apps.get_model("accounts", "User")

    User.objects.filter(
        is_superuser=True
    ).update(
        system_role="ADMIN"
    )


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="system_role",
            field=models.CharField(
                choices=[
                    ("ADMIN", "Admin"),
                    ("USER", "User"),
                ],
                default="USER",
                max_length=10,
            ),
        ),

        migrations.RunPython(
            set_existing_user_roles,
            migrations.RunPython.noop,
        ),
    ]