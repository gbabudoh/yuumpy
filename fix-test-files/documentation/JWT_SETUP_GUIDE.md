# JWT Setup Guide for Yuumpy Admin System

## 🔐 Complete JWT Configuration

### 1. Environment Variables Setup

Add these to your `.env.local` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters-long
```

### 2. Generate a Secure JWT Secret

**Option A: Use the built-in generator**
Visit: `http://localhost:3000/api/test-jwt?action=generate-secret`

**Option B: Generate manually**
```bash
# Using Node.js crypto
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

### 3. Test JWT Configuration

Visit: `http://localhost:3000/api/test-jwt`

This will test:
- ✅ JWT token generation
- ✅ JWT token verification  
- ✅ Admin token creation
- ✅ Configuration validation

### 4. JWT Features Implemented

#### **Token Types:**
- 🔑 **Access Token** - 24 hours expiration
- 🔄 **Refresh Token** - 7 days expiration  
- 👑 **Admin Token** - 8 hours expiration

#### **Security Features:**
- 🛡️ **HS256 Algorithm** - Industry standard
- ⏰ **Automatic Expiration** - Tokens expire automatically
- 🔒 **Secure Secret** - Configurable secret key
- 🎯 **Type Validation** - Token type verification

#### **Admin Integration:**
- 👤 **User Context** - User ID, role, permissions
- 🔐 **Session Management** - Database-backed sessions
- 🚫 **Permission Checks** - Role-based access control
- 🧹 **Auto Cleanup** - Expired session removal

### 5. Usage Examples

#### **Generate Admin Token:**
```typescript
import { generateAdminToken } from '@/lib/jwt-config';

const token = generateAdminToken(userId, role, permissions);
```

#### **Verify Token:**
```typescript
import { verifyJWT } from '@/lib/jwt-config';

const decoded = verifyJWT(token);
```

#### **Protect Admin Routes:**
```typescript
import { withAuth } from '@/lib/admin-middleware';

export const GET = withAuth(async (req) => {
  // Your protected route logic
  return NextResponse.json({ data: 'Protected data' });
}, ['can_manage_users']);
```

### 6. Token Structure

#### **Admin Token Payload:**
```json
{
  "userId": 1,
  "role": "super_admin",
  "permissions": {
    "can_manage_users": true,
    "can_manage_products": true,
    // ... other permissions
  },
  "type": "admin",
  "iat": 1640995200,
  "exp": 1641024000
}
```

### 7. Security Best Practices

#### **✅ Do:**
- Use a strong, random JWT secret (64+ characters)
- Set appropriate expiration times
- Validate tokens on every request
- Use HTTPS in production
- Store secrets in environment variables

#### **❌ Don't:**
- Use default/weak secrets
- Store secrets in code
- Use long expiration times for sensitive operations
- Trust client-side token validation only

### 8. Testing Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/test-jwt` | Test JWT configuration |
| `/api/test-jwt?action=validate` | Validate current setup |
| `/api/test-jwt?action=generate-secret` | Generate new secret |
| `/api/test-jwt?action=token` | Generate test token |

### 9. Production Checklist

- [ ] Set strong JWT_SECRET in production environment
- [ ] Use HTTPS for all admin routes
- [ ] Configure proper CORS settings
- [ ] Set up token refresh mechanism
- [ ] Monitor token usage and expiration
- [ ] Implement rate limiting for auth endpoints

### 10. Troubleshooting

#### **Common Issues:**

**"Invalid token" error:**
- Check JWT_SECRET is set correctly
- Verify token hasn't expired
- Ensure token format is correct

**"Token verification failed":**
- Restart server after changing JWT_SECRET
- Check token type matches expected type
- Verify algorithm compatibility

**"Permission denied":**
- Check user has required permissions
- Verify role-based access control
- Ensure middleware is applied correctly

### 11. Default Admin Users

After running `/api/migrate-admin-users`:

| Username | Password | Role | Permissions |
|----------|----------|------|-------------|
| `admin` | `admin123` | Super Admin | All permissions |
| `content_admin` | `content123` | Content Admin | Products, Categories, Brands |
| `product_admin` | `product123` | Product Admin | Products only |

### 12. Next Steps

1. **Set JWT_SECRET** in your `.env.local`
2. **Run migration**: `/api/migrate-admin-users`
3. **Test JWT**: `/api/test-jwt`
4. **Create admin users**: `/admin/users`
5. **Test login**: Use admin credentials to login

Your JWT system is now fully configured and ready for production! 🚀
