"""
Vercel Serverless Function Entrypoint for CU OPPORTUNITY HUB
Wraps the Flask Application for Vercel Python Runtime
"""

import sys
import os
import shutil

# Add backend directory to sys.path so 'app' imports resolve
current_dir = os.path.dirname(os.path.abspath(__file__))
root_dir = os.path.abspath(os.path.join(current_dir, '..'))
backend_dir = os.path.join(root_dir, 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# If running on Vercel and /tmp database does not exist, copy bundled template
is_vercel = bool(os.getenv('VERCEL') or os.getenv('VERCEL_ENV'))
if is_vercel:
    tmp_db = '/tmp/cu_opportunity_hub.db'
    template_db = os.path.join(root_dir, 'database', 'cu_opportunity_hub.db')
    if not os.path.exists(tmp_db) and os.path.exists(template_db):
        try:
            shutil.copyfile(template_db, tmp_db)
            print("✅ Copied bundled database template to /tmp/cu_opportunity_hub.db")
        except Exception as e:
            print(f"Template database copy notice: {e}")

from app import create_app, db
from app.models import User
from seed import seed_database

app = create_app()

# Auto-initialize and seed database on cold-start if empty
with app.app_context():
    try:
        db.create_all()
        # If no users exist, automatically run seed so Vercel deployment has full data
        if User.query.count() == 0:
            print("⚡ Vercel Cold Start: Auto-seeding demonstration data...")
            seed_database()
        else:
            # Ensure demo student is named Angel
            demo_user = User.query.filter_by(uid='25BIT10180').first()
            if demo_user and demo_user.full_name != 'Angel':
                demo_user.full_name = 'Angel'
                db.session.commit()
    except Exception as e:
        print(f"Database init exception: {e}")

# Vercel looks for the 'app' WSGI instance
if __name__ == '__main__':
    app.run()
