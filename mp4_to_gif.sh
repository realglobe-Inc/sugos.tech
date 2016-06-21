#!/bin/sh -e

mkdir public/videos-gif

ffmpeg -i public/videos/ardrone.mp4  -an -r 15  -pix_fmt rgb24 -f gif public/videos-gif/ardrone.gif
