import click
from flask.cli import with_appcontext
from src.api.models import db, User

def setup_commands(app):

    @app.cli.command("insert-test-users")
    @with_appcontext
    def insert_test_users():
        """Inserts test users into the database."""
        if User.query.filter_by(email="test@test.com").first():
            click.echo("Test users already inserted.")
            return

        test_user = User(
            email="test@test.com",
            password="123456",
            is_active=True,
            name="Test",
            lastname="User",
            address="Calle Test 123"
        )

        db.session.add(test_user)
        db.session.commit()

        click.echo("Test user inserted ")
