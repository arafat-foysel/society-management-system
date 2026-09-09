from rest_framework.permissions import BasePermission


class IsSystemAdmin(BasePermission):
    """
    Allows access only to users with the ADMIN system role.
    Superusers are also treated as system administrators.
    """

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (
                request.user.system_role == "ADMIN"
                or request.user.is_superuser
            )
        )
