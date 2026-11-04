from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import Config
from .models import db

jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.opportunities import opportunities_bp
    from .routes.applications import applications_bp
    from .routes.recommendations import recommendations_bp
    from .routes.notifications import notifications_bp
    from .routes.admin import admin_bp
    from .routes.faculty import faculty_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(opportunities_bp, url_prefix='/api/opportunities')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(recommendations_bp, url_prefix='/api/recommendations')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(faculty_bp, url_prefix='/api/faculty')

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'platform': 'CU OPPORTUNITY HUB',
            'institution': 'Chandigarh University',
            'version': '1.0.0'
        }), 200

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired. Please log in again.'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Invalid authorization token.'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization header required.'}), 401

    return app
