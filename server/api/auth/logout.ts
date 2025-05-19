import { defineEventHandler, setCookie } from 'h3';

export default defineEventHandler((event) => {
  setCookie(event, 'token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'strict'
  });
  
  return { success: true };
});