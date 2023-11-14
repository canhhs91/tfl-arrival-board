#sudo -u canhho epiphany-browser -a -i --profile ~/.config http://localhost:5000 --display=:0 &
#sleep 15s;
#xte "key F11" -x:0
xset -dpms # disable DPMS (Energy Star) features.
xset s off # disable screen saver
xset s noblank # don't blank the video device

unclutter &
matchbox-window-manager &
midori -e Fullscreen -a http://localhost:5000
sleep 15s;
xte "key F11" -x:0
