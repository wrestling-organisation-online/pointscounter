require('dotenv').config();
const axios = require('axios');

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
})

client.on('ready', async () => {
  try {
    const guildId = '927178495031935036';

    await client.application.commands.create({
      name: 'calculate',
      description: 'Calculate user crates with event sale',
      options: [
        {
          name: 'username',
          description: 'Username of accoutn which purchased WOOPARTSUN during last sale',
          type: 3,
          required: true,
        },
        {
          name: 'crypto',
          description: 'Amount of purchased WOOPARTSUN using crypto during event sale',
          type: 10,
          required: true,
        },
        {
          name: 'woobucks',
          description: 'Amount of purchased WOOPARTSUN using WOOBUCKS during event sale',
          type: 10,
          required: true,
        },
      ],
    }, guildId);


    console.log('Slash command registered successfully!');
  } catch (error) {
    console.error('Failed to register slash command:', error);
  }
});


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'calculate') {
    const username = interaction.options.getString('username');
    const crypto = interaction.options.getNumber('crypto');
    const woobucks = interaction.options.getNumber('woobucks');

    function fetchData() {
      return axios.get('https://history.hive-engine.com/accountHistory', {
        params: {
          account: username,
          limit: 1000,
          offset: 0,
          symbol: 'WOOPARTSUN'
        }
      })
        .then(response => {
          const filteredData = response.data.filter(obj => obj.operation === 'tokens_issue');
          const packs = filteredData.reduce((total, obj) => total + parseFloat(obj.quantity), 0);

          return packs;
        })
        .catch(error => {
          console.error('Error:', error);
          throw error;
        });
    }

    try {
      fetchData()
        .then(packs => {
          const points = packs * 10 + crypto * 20 + woobucks * 40;
          const packsAmount = packs + crypto + woobucks;

          const exampleEmbed = new EmbedBuilder()
            .setTitle('Crates Information')
            .setThumbnail(points >= 2000 ? 'https://cdn.discordapp.com/attachments/997572087281635449/1119832791157321749/legendary_crate.png' : 'https://cdn.discordapp.com/attachments/997572087281635449/1119832791874555994/common_crate.png')
            .setDescription(`${username} has ${points} points`)
            .addFields(
              { name: 'You will get', value: points >= 2000 ? `Common Crates: ${packsAmount * 5}\nLegendary Crates: ${packsAmount}` : `Common Crates: ${packsAmount}` },
            )
            .setColor('#ffe554')
            .setImage('https://example.com/image.png')
            .setTimestamp();

          interaction.reply({ embeds: [exampleEmbed] });
        })
        .catch(error => {
          console.error(error);
          interaction.reply('An error occurred while processing your request.');
        });
    } catch (error) {
      console.error(error);
      interaction.reply('An error occurred while processing your request.');
    }
  }
});

client.login(process.env.CLIENT_TOKEN);




