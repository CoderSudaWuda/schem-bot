require('dotenv/config');

// DISCORD.JS LIB

const { Client, MessageEmbed } = require('discord.js');
const Enmap = require('enmap');
const client = new Client();

const players = new Enmap();

client.login(process.env.TOKEN);

client.once('ready', () => {
    console.log('[META][INFO]: Bot booted.');
});

client.on('error', console.error);

client.on('message', async message => {
    if (message.channel.name == 'mini-sbx-links') {
        if (!message.content.includes('diep.io/#')) return message.delete();

        message.react('✅');
        const filter = (reaction, _user) => { return reaction.emoji.name == '✅' };

        const collector = message.createReactionCollector(filter, {});

        collector.on('collect', (reaction, user) => {
            let pass = true;

            if (players.has(message.id)) {
                if (players.get(message.id).includes(user.tag))
                    pass = false;
            }

            if (!pass) return;

            if (user.bot) return;

            if (reaction.emoji.name == '✅') {
                const arguments = message.content.split(' ');
                let link = arguments.shift();

                if (!link.startsWith('https://')) link = `https://${link}`;

                user.send(new MessageEmbed().setTitle('Link').addField('Link', link).addField('Extra Notes', (arguments.join(' ') || 'No extra notes.') ));

                let prevValue = players.get(message.id) || [];
                prevValue.push(user.tag);

                players.set(message.id, prevValue);
            }
        });
    }

    const prefix = '$';

    if (!message.content.startsWith(prefix)) return; 
    if (message.author.bot) return;
    if (message.channel.type != 'text') return;

    const args = message.content.split(' '),
        command = args.shift().toLowerCase().replace(prefix, '');
    
    if (command == 'fetch') {
        const id = args[0];
        if (!id) return message.channel.send('Please input a message ID to check which players have recieved that link.');
        if (!players.has(id)) return message.channel.send('Invalid Message ID.');

        const array = players.get(id);
        const str = array.join('\n');

        message.channel.send('Ok! Here you go!');
        message.channel.send(new MessageEmbed().setTitle(`Players of Message ID: **${id}**`).setDescription(str));
    }
});