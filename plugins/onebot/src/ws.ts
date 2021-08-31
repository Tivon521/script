import { App, Adapter, Logger, assertProperty, camelCase, Time, Session } from 'koishi'
import { CQBot } from './bot'
import { SharedConfig, adaptSession, adaptUser, Response } from './utils'
import WebSocket from 'ws'

const logger = new Logger('onebot')

export class WebSocketClient extends Adapter.WebSocketClient<CQBot, SharedConfig> {
  protected connect = connect

  constructor(app: App, config: SharedConfig) {
    super(app, CQBot, config)
  }

  prepare(bot: CQBot) {
    const { server, token } = bot.config
    const headers: Record<string, string> = {}
    if (token) headers.Authorization = `Bearer ${token}`
    return new WebSocket(server, { headers })
  }
}

export class WebSocketServer extends Adapter<CQBot, SharedConfig> {
  public wsServer?: WebSocket.Server

  protected connect = connect

  constructor(app: App, config: SharedConfig) {
    super(app, CQBot, config)
    assertProperty(app.options, 'port')
    const { path = '/onebot' } = config
    this.wsServer = new WebSocket.Server({
      path,
      server: this.app._httpServer,
    })
  }

  start() {
    return new Promise<void>((resolve, reject) => {
      this.wsServer.on('error', reject)
      this.wsServer.on('connection', (socket, { headers }) => {
        logger.debug('connected with', headers)
        if (headers['x-client-role'] !== 'Universal') {
          return socket.close(1008, 'invalid x-client-role')
        }
        const selfId = headers['x-self-id'].toString()
        const bot = this.bots.find(bot => bot.selfId === selfId)
        if (!bot) return socket.close(1008, 'invalid x-self-id')

        bot.socket = socket
        this.connect(bot).then(() => {
          if (this.bots.every(({ socket, config }) => socket || !config.server)) resolve()
        }, reject)
      })
    })
  }

  stop() {
    logger.debug('ws server closing')
    this.wsServer.close()
    for (const bot of this.bots) {
      bot.socket = null
    }
  }
}

let counter = 0
const listeners: Record<number, (response: Response) => void> = {}

export function connect(this: Adapter<CQBot, SharedConfig>, bot: CQBot) {
  return new Promise<void>((resolve, reject) => {
    bot.socket.on('message', (data) => {
      data = data.toString()
      let parsed: any
      try {
        parsed = JSON.parse(data)
      } catch (error) {
        return logger.warn('cannot parse message', data)
      }

      if ('post_type' in parsed) {
        logger.debug('receive %o', parsed)
        const session = adaptSession(parsed)
        if (session) bot.adapter.dispatch(new Session(bot.app, session))
      } else if (parsed.echo === -1) {
        Object.assign(bot, adaptUser(camelCase(parsed.data)))
        logger.debug('%d got self info', parsed.data)
        if (bot.config.server) {
          logger.info('connected to %c', bot.config.server)
        }
        resolve()
      } else if (parsed.echo in listeners) {
        listeners[parsed.echo](parsed)
        delete listeners[parsed.echo]
      }
    })

    bot.socket.on('close', () => {
      delete bot._request
    })

    bot.socket.send(JSON.stringify({
      action: 'get_login_info',
      echo: -1,
    }), (error) => {
      if (error) reject(error)
    })

    bot._request = (action, params) => {
      const data = { action, params, echo: ++counter }
      data.echo = ++counter
      return new Promise((resolve, reject) => {
        listeners[data.echo] = resolve
        setTimeout(() => {
          delete listeners[data.echo]
          reject(new Error('response timeout'))
        }, this.config.responseTimeout || Time.minute)
        bot.socket.send(JSON.stringify(data), (error) => {
          if (error) reject(error)
        })
      })
    }
  })
}
