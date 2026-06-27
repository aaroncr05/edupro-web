#!/usr/bin/env node

/**
 * Script para generar secretos seguros para el .env
 * Uso: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

function generatePassword(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }
  return password;
}

console.log('\n🔐 SECRETOS GENERADOS PARA .env\n');
console.log('='.repeat(60));
console.log('\n# JWT Secret (copiar en JWT_SECRET)');
console.log(`JWT_SECRET="${generateSecret(64)}"`);
console.log('\n# Contraseña PostgreSQL (ejemplo)');
console.log(`DB_PASSWORD="${generatePassword(32)}"`);
console.log('\n' + '='.repeat(60));
console.log('\n⚠️  GUARDA ESTOS VALORES EN UN LUGAR SEGURO');
console.log('⚠️  NUNCA LOS COMMITAS AL REPOSITORIO\n');