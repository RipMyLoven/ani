#!/bin/bash

set -e  

echo "🔧 Installing Node.js and npm..."

if ! command -v nvm &> /dev/null; then
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
else
  echo "nvm is already installed"
fi

nvm install --lts
nvm use --lts

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

echo "📦 Installing pnpm..."

curl -fsSL https://get.pnpm.io/install.sh | sh -
export PATH="$HOME/.local/share/pnpm:$PATH"

if ! grep -q 'pnpm' "$HOME/.bashrc" 2>/dev/null && ! grep -q 'pnpm' "$HOME/.zshrc" 2>/dev/null; then
  echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> "$HOME/.bashrc"
  echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> "$HOME/.zshrc"
  echo 'export PATH="$HOME/.local/share/pnpm:$PATH"' >> "$HOME/.profile"
fi

echo "✅ pnpm version: $(pnpm -v)"

echo "🧠 Installing and updating SurrealDB..."

curl -sSf https://install.surrealdb.com | sh
export PATH="$HOME/.surrealdb:$PATH"

if ! grep -q 'surrealdb' "$HOME/.bashrc" 2>/dev/null && ! grep -q 'surrealdb' "$HOME/.zshrc" 2>/dev/null; then
  echo 'export PATH="$HOME/.surrealdb:$PATH"' >> "$HOME/.bashrc"
  echo 'export PATH="$HOME/.surrealdb:$PATH"' >> "$HOME/.zshrc"
  echo 'export PATH="$HOME/.surrealdb:$PATH"' >> "$HOME/.profile"
fi

echo "✅ SurrealDB version: $(surreal version)"

echo "📁 Installing project dependencies using pnpm..."
pnpm install

echo "✅ Done! All dependencies have been installed."
echo "🔁 Please restart your terminal or run 'source ~/.bashrc' or 'source ~/.zshrc' to update your PATH."
