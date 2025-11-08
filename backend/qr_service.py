"""
QR Code Generation Service for AR Voting Badge
Generates QR codes that unlock the AR voting badge experience
"""

from flask import Flask, jsonify, send_file
from flask_cors import CORS
import qrcode
from io import BytesIO
import base64
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

@app.route('/api/qr/generate', methods=['POST'])
def generate_qr():
    """
    Generate a QR code for AR voting badge
    Returns QR code as base64 image
    """
    try:
        from flask import request
        data = request.get_json() or {}
        
        # Get voter ID and election info
        voter_id = data.get('voterId', 'default')
        election_id = data.get('electionId', 'default')
        transaction_hash = data.get('transactionHash', '')
        
        # Create QR code data
        qr_data = f"voting-badge-ar://{voter_id}/{election_id}/{transaction_hash}"
        
        # Generate QR code
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        # Create image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        # Encode to base64
        img_base64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        return jsonify({
            'success': True,
            'qrCode': f'data:image/png;base64,{img_base64}',
            'qrData': qr_data,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/qr/verify', methods=['POST'])
def verify_qr():
    """
    Verify QR code data
    """
    try:
        from flask import request
        data = request.get_json() or {}
        qr_data = data.get('qrData', '')
        
        # Verify QR code format
        if qr_data.startswith('voting-badge-ar://'):
            parts = qr_data.replace('voting-badge-ar://', '').split('/')
            if len(parts) >= 2:
                return jsonify({
                    'success': True,
                    'valid': True,
                    'voterId': parts[0],
                    'electionId': parts[1] if len(parts) > 1 else None,
                    'transactionHash': parts[2] if len(parts) > 2 else None
                })
        
        return jsonify({
            'success': True,
            'valid': False,
            'error': 'Invalid QR code format'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'QR Code Generation Service'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)

