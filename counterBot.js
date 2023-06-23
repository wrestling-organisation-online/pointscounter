require('dotenv').config();
const axios = require('axios');

const { Client, GatewayIntentBits, EmbedBuilder   } = require('discord.js');
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
          description: 'The username to check amount of WOOPARTSUN during last sale',
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

    const requestBody = {
      jsonrpc: '2.0',
      id: 1687545623476,
      method: 'find',
      params: {
        contract: 'nft',
        table: 'WOOLANDinstances',
        query: {
          $or: [
            { account: username },
            {
              account: 'nftmarket',
              ownedBy: 'c',
              previousAccount: username,
            },
          ],
        },
        offset: 0,
        limit: 1000,
      },
    };

    try {
      const response = await axios.post('https://enginerpc.com/contracts', requestBody);
      const packs = response.data.result.length
      const points = packs*10 + crypto*20 + woobucks*40
      const packsAmount = packs + crypto + woobucks

      const exampleEmbed = new EmbedBuilder()
        .setTitle('Crates Information')
        .setThumbnail('https://media.discordapp.net/attachments/954737938401484831/954739157396250704/1up_cartel_woo.png')
        .setDescription(`Username: ${username}\nPoints: ${points}`)
        .addFields(
          { name: 'You will get', value: points >= 2000 ? `Common Crates: ${packsAmount*5}\nLegendary Crates: ${packsAmount}` : `Common Crates: ${packsAmount}`},
        )
        .setColor('#ffe554')
        .setImage('https://example.com/image.png')
        .setTimestamp();

      interaction.reply({ embeds: [exampleEmbed] });
    } catch (error) {
      console.error(error);
      interaction.reply('An error occurred while processing your request.');
    }
  }
});

client.login(process.env.CLIENT_TOKEN);




