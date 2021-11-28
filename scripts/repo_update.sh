#!/bin/bash
set -e
REPO_DIR=$1/discord-lingui-repo

echo "Resetting translations repo"
cd $REPO_DIR/src/locales/translations
git reset --hard
git pull origin develop

echo "Updating olympus-frontend repo"
cd $REPO_DIR
git pull origin develop


