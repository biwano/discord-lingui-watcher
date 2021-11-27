#!/bin/bash
set -e
REPO_DIR=$1/discord-lingui-repo
SUBDIR=$2
cd $REPO_DIR$SUBDIR
git log -1 --format=%H