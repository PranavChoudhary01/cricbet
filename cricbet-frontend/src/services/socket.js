import { io } from 'socket.io-client'

let socket = null

export const getSocket = () => {
  if (!socket) {
    socket = io('/', {
      auth: { token: localStorage.getItem('cb_token') },
      transports: ['websocket'],
    })
  }
  return socket
}

export const joinMatch = (matchId) => getSocket().emit('join_match', matchId)
export const leaveMatch = (matchId) => getSocket().emit('leave_match', matchId)

export const onOddsUpdate = (cb) => getSocket().on('odds_update', cb)
export const offOddsUpdate = (cb) => getSocket().off('odds_update', cb)
