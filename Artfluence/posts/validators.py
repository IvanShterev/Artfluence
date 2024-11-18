from django.core.exceptions import ValidationError


def validate_file_size(file, max_size_mb=5):
    max_size_bytes = max_size_mb * 1024 * 1024
    if file.size > max_size_bytes:
        raise ValidationError(
            f"File size must not exceed {max_size_mb} MB. Current file size is {file.size / (1024 * 1024):.2f} MB."
        )