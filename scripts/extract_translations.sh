#!/bin/bash
set -e
REPO_DIR=$1/discord-lingui-repo
cd $REPO_DIR
yarn lingui:extract | tail -n +2 | head -n -1