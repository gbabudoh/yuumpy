#!/bin/bash
# Test email from VPS command line
# Run this script on your VPS server

echo "Testing SMTP connection from VPS..."

# Test SMTP connection using telnet or openssl
echo "Testing connection to mail.yuumpy.com:587..."
timeout 5 telnet mail.yuumpy.com 587 || echo "Connection failed - port may be blocked or server not accessible"

echo ""
echo "If connection works, you can test email sending using:"
echo "curl http://localhost:3000/api/test-email?send_test=true&to=orders@yuumpy.com"

