import { ShardingManager } from 'discord.js';

require('dotenv').config();

// This file is unusable for a while

const shardManager = new ShardingManager('./structures/violet.ts', {
  token: process.env.TEST,
});

shardManager.spawn();
