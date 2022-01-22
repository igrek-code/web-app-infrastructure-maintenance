mysql --user=projet --password=tejorp projet < create_table.sql &&
apt-get -y install nodejs npm &&
npm install -g forever &&
npm install &&
forever start app.js &&
echo "WEB APP STARTED SUCCESSFULLY !";