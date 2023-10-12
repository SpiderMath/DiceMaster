const { Client } = require("revolt.js");
const { config } = require("dotenv");
const { stripIndents } = require("common-tags");
config();

const PREFIX = process.env.BOT_PREFIX ?? "!";
const MIN_DICE = 1;
const MIN_SIDES = 1;
const MAX_DICE = 15;
const MAX_SIDES = Number.MAX_SAFE_INTEGER;

const client = new Client();

async function wait(fn, time) {
	return new Promise((resolve) => {
		setTimeout(() => resolve(fn()), time)
	});
}

const inRange = (val, range) => val >= range[0] && val <= range[1];

client.on("ready", () => {
	console.log(`Logged in as ${client.user.username}`);
});

client.on("messageCreate", async (message) => {
	if(!message.content) return;
	const args = message.content.split(/ +/g);
	let cmd = args.shift().toLowerCase();

	if(!cmd.startsWith(PREFIX)) return;
	cmd = cmd.slice(PREFIX.length);

	if(cmd === "help") {
		// Help command
		return await message.reply({
			embeds: [{
				title: "Dice Goblin",
				description: stripIndents`Hello! This is the Dice Goblin, a very simple bot to help you with your dice rolling requirements!

				Type \`?<c>d<n>\` to roll some dice! :${process.env.DICE_ROLLING_EMOJI_ID}:\n
				**\`<c>\`** is an optional (integral) parameter [range: ${MIN_DICE}-${MAX_DICE}], and denotes the number of die you can roll at once *(default: 1)*
				**\`<n>\`** is also an optional (integral) parameter [range: ${MIN_SIDES}-${MAX_SIDES}], and denotes the number of sides on the side you are going to roll *(default: 6)*
				
				**Examples:**
				- \`?d\` rolls *1* d6 die :${process.env.DIE_EMOJI_ID}:
				- \`?4d20\` rolls *4* d20 dice :${process.env.DIE_EMOJI_ID}:`,
				colour: "RED",
			}],
		});
	}

	// Dice roll command
	const params = cmd.split("d");
	const numOfDice = params[0] === "" ? 1 : Number(params[0]); // Stores the number of dice to roll at once
	const numOfSides = params[1] === "" ? 6 : Number(params[1]); // Stores the number of sides in the dice

	// Ignore if they don't even give a number
	if(Number.isNaN(numOfDice) || Number.isNaN(numOfSides))
		return;

	// Non-integral input
	if(!Number.isInteger(numOfDice))
		return message.reply("Please provide an integer value for the number of dice to roll");
	if(!Number.isInteger(numOfSides))
		return message.reply("Please provide an integer value for the number of sides of the dice");

	if(!inRange(numOfDice, [MIN_DICE, MAX_DICE]))
		return message.reply(`Number of dice needs to belong in the range ${MIN_DICE}-${MAX_DICE}`);
	if(!inRange(numOfSides, [MIN_SIDES, MAX_SIDES]))
		return message.reply(`Number of sides of a dice needs to belong in the range ${MIN_SIDES}-${MAX_SIDES}`);

	let content = `Rolling ${numOfDice} **d${numOfSides}**${numOfDice === 1 ? "" : "s"} :${process.env.DICE_ROLLING_EMOJI_ID}: \n`;
	const msg = await message.reply(content);

	for(let i = 1; i <= numOfDice; i++) {
		const roll = Math.floor(Math.random() * numOfSides) + 1;
		content += `\n*:${process.env.DIE_EMOJI_ID}:${i}:* **${roll}**`;

		await wait(() => msg.edit({
			content,
		}), 1500);
	}
});

client.loginBot(process.env.REVOLT_BOT_TOKEN);	
