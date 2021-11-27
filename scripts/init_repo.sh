#!/bin/bash
set -e
TMP_DIR=$1/discord-lingui-tmp
REPO_DIR=$1/discord-lingui-repo
REPOSITORY=$2
[ -e $REPO_DIR/.git ] && exit 0;

echo "Removing temporary directory $TMP_DIR"
rm -rf $TMP_DIR

echo "Cloning repository $REPOSITORY in $TMP_DIR"
git clone $REPOSITORY $TMP_DIR
cd $TMP_DIR

echo "Changing translation branch to develop"
yarn lingui:branch:develop

echo "Installing dependencies"
yarn install

echo "Replacing repository dir $REPO_DIR with $TMP_DIR"
rm -rf $REPO_DIR
mv $TMP_DIR $REPO_DIR
