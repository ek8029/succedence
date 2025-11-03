-- Check current user roles for known admin emails
SELECT id, email, name, role
FROM users
WHERE email IN (
  'evank8029@gmail.com',
  'succedence@gmail.com',
  'founder@succedence.com',
  'clydek627@gmail.com'
);

-- Set admin role for these users
UPDATE users
SET role = 'admin'
WHERE email IN (
  'evank8029@gmail.com',
  'succedence@gmail.com',
  'founder@succedence.com',
  'clydek627@gmail.com'
)
AND role != 'admin';

-- Verify the update
SELECT id, email, name, role
FROM users
WHERE email IN (
  'evank8029@gmail.com',
  'succedence@gmail.com',
  'founder@succedence.com',
  'clydek627@gmail.com'
);
