require('dotenv').config();
const mysql = require('mysql');
const axios = require('axios');
const { Client, IntentsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
// const storagedb = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
// })
const prefix = '~';

// storagedb.connect( function (err) {
//     if(err){
//         console.log(err);
//     } else {
//         console.log(`Connected to DB!!`);
//     }
// })

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online`); 

    client.user.setActivity({
        name: '~help'
    });
});

client.on('messageCreate', async (msg) => {
    // console.log(msg);

    let args = msg.content.substring(prefix.length).split(" ");

    if(msg.content.startsWith(`${prefix}player`)){
        let getPlayer = async () => {
            let response;
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
            }
            await axios.get('https://servers-frontend.fivem.net/api/servers/single/5q3ez7',{headers})
            .then(res => {
                response = res.data;                
            })
            .catch(err => {
                console.log('Line 54',err);
                // console.log('Line 54');
                response = null;
            });
            // console.log(response.data);
            return response;
        }

        let getUserNick = async (userID) => {
            let nick;
            let role = null;
            const headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
                'Authorization' : process.env.FAD_TOKEN
            }
            await axios.get(`https://discord.com/api/v9/users/${userID}/profile?guild_id=803866821765496842`,{headers})
            .then(res => {
                if (res.data.guild_member.nick == null) {
                    nick = res.data.user.global_name;
                }else {
                    nick = res.data.guild_member.nick;

                    if(res.data.guild_member.roles.includes("1084732265071911015")){
                        role = 'valentine';
                    } else if(res.data.guild_member.roles.includes("1084732735819620402")){
                        role = 'lemoyne';
                    } else if(res.data.guild_member.roles.includes("1095831820169379981")){
                       role = 'west';
                    }
                }
            })
            .catch(err => {
                console.log('Line 76',err);
                // console.log('Line 76');
                nick = '';
            });  
            return [nick, role];      
        }

        const sleep = (delay) => {
            return new Promise(function(resolve) {
                setTimeout(resolve, delay);
            });
        }

        function sortName (data){
            let sortedData;
            
            sortedData = data.sort(function(a,b){
              let x = a.discord.replace(' ','').toLowerCase();
              let y = b.discord.replace(' ','').toLowerCase();
              if(x>y){return 1;}
              if(x<y){return -1;}
              return 0;
            });
            
            return sortedData;
        }
        
        let last_msg;   
        let timer;

        while (true) {
            let start = Date.now();
            let playerList = await getPlayer();
            let playerArray = [];
            let val = [{name: `⚪ Valentine`}];
            let lmy = [{name: `🔵 Lemoyne`}];
            let west = [{name: `🔴 West Elizabeth`}];
            let free = [{name: `🟤 Freelance`}];

            if (playerList != null) {
                
                for (const element of playerList.Data.players) {
                    for (const iden of element.identifiers) {
                        if (iden.substring(0, 7) == 'discord') {
                            let userID = iden.substring(8)
                            let nick = await getUserNick(userID);
                            // console.log(nick, new Date().toLocaleTimeString());
                            // console.log(nick);
                            if(nick[1] == 'valentine'){
                                val.push({
                                    id: element.id,
                                    passport: element.name,
                                    discord: nick[0]
                                })
                            } else if(nick[1] == 'lemoyne'){
                                lmy.push({
                                    id: element.id,
                                    passport: element.name,
                                    discord: nick[0]
                                })
                            } else if(nick[1] == 'west'){
                                west.push({
                                    id: element.id,
                                    passport: element.name,
                                    discord: nick[0]
                                })
                            } else {
                                free.push({
                                    id: element.id,
                                    passport: element.name,
                                    discord: nick[0]
                                })
                            }
                        }
                        await sleep(1000);
                    }  
        
                }; 
        
                let line = [];
                line.push({
                    name: `>>> Total Players`,
                    value:  "```\n"+playerList.Data.clients+"/"+playerList.Data.sv_maxclients+"\n```",
                    inline: true
                })
                
                playerArray = [val, lmy, west, free];
                            
                playerArray.forEach(role => {
                    if (role.length > 1) {
                        let value = '';
                        for (let index = 1; index < role.length; index++) {
                            let format = "("+role[index].id+")";
                            value += `${format.padEnd(5,' ')} ${role[index].discord}\n`;
                        }
                        
                        line.push({
                            name: `>>> ${role[0].name}`,
                            value:  "```"+value+"```",
                        })
                    }
                });
    
                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle(`** 🐎 Watching Desa Indopride**`)
                    .setThumbnail('https://cdn.discordapp.com/attachments/1087299203023261756/1120507560512995328/idp.gif?ex=655bf6fc&is=654981fc&hm=cd37abd182e7b68f01582c2a68ea3eb75bf3c558bd8410ff2f3927318f0ddf4d&')
                    .addFields(line)
                    .setTimestamp()
                    .setFooter({ text: `Update every minutes • Last update: ${new Date().toLocaleTimeString()}`, iconURL: 'https://cdn.discordapp.com/attachments/1153860372487491614/1172117430940745788/favicon.png?ex=655f266c&is=654cb16c&hm=cfdf72a1012e8ce18c72f707bd9dc8433ba934bc43d4cdff3bcde7df9bc7b775&' });  
    
                const button = new ButtonBuilder()
                    .setLabel('Cfx.re')
                    .setURL('https://servers.redm.gg/servers/detail/5q3ez7')
                    .setEmoji('🌐')
                    .setStyle(ButtonStyle.Link);
    
                const row = new ActionRowBuilder().addComponents(button);
    
                if (last_msg == undefined) {
                    last_msg = await msg.channel.send({
                        embeds: [embed], 
                        components: [row],
                        flags: [ 4096 ]});
                } else {
                    last_msg = await last_msg.edit({
                        embeds: [embed], 
                        components: [row],
                        flags: [ 4096 ]
                    });
                }
            }
            let end = Date.now();

            timer = 60000 - (end - start);
            if(timer < 0 ){
                timer = 500;
            }

            await sleep(timer)
        }
    }    
});

client.login(process.env.TOKEN);

 