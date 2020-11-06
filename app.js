const Discord = require('discord.js');
const express = require('express');
const client = new Discord.Client();
const config = require("./config.json");

var Server1ServerConfig = require("./config/Server1Server.config.json");

client.on('ready', () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity(` ?invites`);
});


//Lazy code, this wont be running on a production scale and im really bad with javascript.
client.on('message', message => {

    if(message.guild.id == Server1ServerConfig.Id)
        Server1ServerHandle(message);
    else
        NormalHandle(message);
});

function NormalHandle(message)
{
    //Ignore bot messages.
    if(message.author.bot) return;
    //Ignore message if it doesnt start with prefix
    if(message.content.indexOf(config.prefix) !== 0) return;

    console.log("Recieved message: " + message.content);

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    console.log(`Arguments: ${args}`);
    console.log(`Command: ${command}`);

    if( (command == 'help' || command == 'h') && message.guild.available)
    {
        message.channel.send(`**Commands:**\n**?h** or **?help** - Displays the commands.\n**?ping** - Pings the server & Discord API.\n**?invites** *(optional: @ another user)* - Fetches your (or mentioned user's) count of invited users.\n`
                            +'**?mylinks** - *(optional: @ another user)* - Fetches your invite links & whether they are permenant.');
    }

    else if(command == 'invites' && message.guild.available)
    {
        var targetUser = null;
        var isAnotherUserLookup = false;
        if(message.mentions.members.first() != null)
        {
            targetUser = message.mentions.members.first().user;
            console.log(targetUser.user);
            isAnotherUserLookup = true;
        }
        else
            targetUser = message.author;

        message.guild.fetchInvites()
        .then
        (invites =>
            {
                const userInvites = invites.array().filter(o => o.inviter.id === targetUser.id);
                var userInviteCount = 0;
                    for(var i=0; i < userInvites.length; i++)
                    {
                        var invite = userInvites[i];
                        userInviteCount += invite['uses'];
                    }
                    if(isAnotherUserLookup)
                        message.channel.send(`User _${targetUser.user.username}_ has ${userInviteCount} invites.`)
                    else
                        message.reply(`You have ${userInviteCount} invites. Keep up the good work!`)
            }
        )
        .catch(console.error);
    }
    else if(command == 'mylinks' && message.guild.available)
    {
        var targetUser = null;
        var isAnotherUserLookup = false;
        if(message.mentions.members.first() != null)
        {
            targetUser = message.mentions.members.first().user;
            console.log(targetUser.user);
            isAnotherUserLookup = true;
        }
        else
            targetUser = message.author;

        message.guild.fetchInvites()
        .then
        (invites =>
            {
                const userInvites = invites.array().filter(o => o.inviter.id === targetUser.id);
                var userInviteLinksStr = '';
                    for(var i=0; i < userInvites.length; i++)
                    {
                        var invite = userInvites[i];
                        userInviteLinksStr += `Link: *discord.gg/${invite['code']}* - Permenant: *${!invite['temporary']}*\n`;
                    }
                    if(isAnotherUserLookup)
                        message.channel.send(`User _${targetUser.username}_'s invite links are \n${userInviteLinksStr}.`);
                    else
                        message.reply(`Your invite links are \n${userInviteLinksStr} \nEnjoy!`);
            }
        )
        .catch(console.error);
    }

    else if (command == 'ping' && message.guild.available)
    {
        message.channel.send("Ping you say?")
        .then(m => message.channel.send(`Well, pong!\nLatency is ${m.createdTimestamp - message.createdTimestamp}ms. \nAPI Latency is ${Math.round(client.ping)}ms. Have a good day sir!`))
        .catch(console.error);

    }
}


function Server1ServerHandle(message)
{
    //Ignore bot messages.
    if(message.author.bot) return;
    //Ignore message if it doesnt start with prefix
    if(message.content.indexOf(config.prefix) !== 0) return;


    console.log("Recieved message: " + message.content);

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    console.log(`Arguments: ${args}`);
    console.log(`Command: ${command}`);

    if( (command == 'help' || command == 'h') && message.guild.available)
    {
        message.channel.send(`**Commands:**\n**?h** or **?help** - Displays the commands.\n**?ping** - Pings the server & Discord API.\n**?invites** *(optional: @ another user)* - Fetches your (or mentioned user's) count of invited users.\n`
                            +'**?mylinks** - *(optional: @ another user)* - Fetches your invite links & whether they are permenant.\nYou will be promoted based on your invite count automatically after using **?invites**');
    }

    else if(command == 'invites' && message.guild.available)
    {
        var targetUser = null;
        var isAnotherUserLookup = false;
        if(message.mentions.members.first() != null)
        {
            targetUser = message.mentions.members.first();
            isAnotherUserLookup = true;
        }
        else
            targetUser = message.member;

        message.guild.fetchInvites()
        .then
        (invites =>
            {

                const userInvites = invites.array().filter(o => o.inviter.id === targetUser.id);
                var userInviteCount = 0;
                    for(var i=0; i < userInvites.length; i++)
                    {
                        var invite = userInvites[i];
                        userInviteCount += invite['uses'];
                    }
                var HighestRoleName = "";
                var HighestRoleCounter = 0;
                    for(var i=0; i < Server1ServerConfig.MinimumInviteCountRoles.length; i++)
                    {
                        var RoleName = Server1ServerConfig.MinimumInviteCountRoles[i]["Name"]
                            if (userInviteCount >= Server1ServerConfig.MinimumInviteCountRoles[i]["Value"])
                            {
                                HighestRoleName = RoleName;
                                HighestRoleCounter = i;
                                //Outputs a console error for soem reason.
                                targetUser.addRole(message.guild.roles.find(role => role.name === RoleName));
                            }
                    }

                    if(HighestRoleCounter+1 >= Server1ServerConfig.MinimumInviteCountRoles.length)
                        var requires = `have maximum rank.`;
                    else
                        var requires = `highest owned rank is: <@&${Server1ServerConfig.MinimumInviteCountRoles[HighestRoleCounter]["Id"]}>`
                        +`\nrequires ${Server1ServerConfig.MinimumInviteCountRoles[HighestRoleCounter+1]["Value"]-userInviteCount} invites to be promoted to  <@&${Server1ServerConfig.MinimumInviteCountRoles[HighestRoleCounter+1]["Id"]}>.`;
                    if(isAnotherUserLookup)
                        message.channel.send(`User _${targetUser.user.username}_ has ${userInviteCount} invites.`
                                            +`\nTheir ${requires}`);
                    else
                        message.reply(`You have ${userInviteCount} invites. Keep up the good work!`
                                    +`\nYour ${requires}`);
            }
        )
        .catch(console.error);
    }

    else if(command == 'mylinks' && message.guild.available)
    {
        var targetUser = null;
        var isAnotherUserLookup = false;
        if(message.mentions.members.first() != null)
        {
            targetUser = message.mentions.members.first().user;
            console.log(targetUser.user);
            isAnotherUserLookup = true;
        }
        else
            targetUser = message.author;

        message.guild.fetchInvites()
        .then
        (invites =>
            {
                const userInvites = invites.array().filter(o => o.inviter.id === targetUser.id);
                var userInviteLinksStr = '';
                    for(var i=0; i < userInvites.length; i++)
                    {
                        var invite = userInvites[i];
                        userInviteLinksStr += `Link: *discord.gg/${invite['code']}* - Permenant: *${!invite['temporary']}*`;
                    }
                    if(isAnotherUserLookup)
                        message.channel.send(`User _${targetUser.username}_'s invite links are \n${userInviteLinksStr}.`);
                    else
                        message.reply(`Your invite links are \n${userInviteLinksStr} \nEnjoy!`);
            }
        )
        .catch(console.error);
    }

    else if (command == 'ping' && message.guild.available)
    {
        message.channel.send("Ping you say?")
        .then(m => message.channel.send(`Well, pong!\nLatency is ${m.createdTimestamp - message.createdTimestamp}ms. \nAPI Latency is ${Math.round(client.ping)}ms. Have a good day sir!`))
        .catch(console.error);

    }
}

//DO NOT SHARE THIS TOKEN PUBLICLY!!
//Replace this code with your token.
if(process.env.TOKEN_VAR != null)
    var token = process.env.TOKEN_VAR;
else
    var token = config.token;

require('./server')();
client.login(token);
