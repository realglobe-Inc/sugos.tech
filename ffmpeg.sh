#!/bin/sh -e


# ffmpeg -i public/videos/SUGOS_remote_PLEN.mp4 -vf scale=320:-1 -strict -2 public/videos/SUGOS_remote_PLEN.mp4

for file in `ls public/videos`; do
    path="public/videos/${file}"
    ffmpeg -i $path -vf scale=320:-1 -strict -2 public/video/$file
done
