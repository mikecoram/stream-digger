export const getImplicitGrantURI = (): string =>
  `https://accounts.spotify.com/authorize?${new URLSearchParams({
    client_id: 'd48e33355f30490aa2a952bbf70055ad',
    redirect_uri: 'https://mikecoram.github.io/buy-music',
    response_type: 'token',
    state: Math.random().toString()
  }).toString()}`
