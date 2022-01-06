import fetch from 'cross-fetch';

export async function getChampion(id: string) {
  const request = await fetch('http://ddragon.leagueoflegends.com/cdn/11.24.1/data/en_US/champion.json');
  const champions = await request.json();
  for (const champion in champions.data) {
    if (champions.data[champion].key === id) return champion;
  }
}

export async function getUserLastGames(region: string, summoner: {name: string, puuid: string}, count: number) {
  let wins = 0; let
    defeats = 0;
  const secondRequest = await fetch(`https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${summoner.puuid}/ids?start=0&count=${count}&api_key=${process.env.RGKEY}`);
  const history = await secondRequest.json();
  for (const matchId of history) {
    const thirdRequest = await fetch(`https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${process.env.RGKEY}`);
    const matches = await thirdRequest.json();
    for (const participant of matches.info.participants) {
      if (participant.summonerName === summoner.name) {
        if (participant.win) wins += 1;
        if (!participant.win) defeats += 1;
      }
    }
  }
  const winrate = Math.floor((wins / count) * 100);
  return { wins, defeats, winrate };
}
