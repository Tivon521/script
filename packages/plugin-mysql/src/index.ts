import MysqlDatabase, { Config } from './database'
import { User, Channel, Database, extendDatabase, Context } from 'koishi-core'
import { difference } from 'koishi-utils'

export * from './database'
export default MysqlDatabase

declare module 'koishi-core/dist/database' {
  interface Database extends MysqlDatabase {}
}

extendDatabase(MysqlDatabase, {
  async getUser(type, id, _fields) {
    const fields = _fields ? this.inferFields('user', _fields) : User.fields
    if (fields && !fields.length) return { [type]: id } as any
    if (Array.isArray(id)) {
      if (!id.length) return []
      const list = id.map(id => this.escape(id)).join(',')
      return this.select<User>('user', fields, `?? IN (${list})`, [type])
    }
    const [data] = await this.select<User>('user', fields, '?? = ?', [type, id])
    return data && { ...data, [type]: id }
  },

  async removeUser(type, id) {
    await this.query('DELETE FROM `user` WHERE ?? = ?', [type, id])
  },

  async createUser(type, id, data) {
    data[type as any] = id
    const newKeys = Object.keys(data)
    const assignments = difference(newKeys, [type]).map((key) => {
      key = this.escapeId(key)
      return `${key} = VALUES(${key})`
    }).join(', ')
    const user = Object.assign(User.create(type, id), data)
    const keys = Object.keys(user)
    await this.query(
      `INSERT INTO ?? (${this.joinKeys(keys)}) VALUES (${keys.map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE ${assignments}`,
      ['user', ...this.formatValues('user', user, keys)],
    )
  },

  async setUser(type, id, data) {
    data[type as any] = id
    const keys = Object.keys(data)
    const assignments = difference(keys, [type]).map((key) => {
      return `${this.escapeId(key)} = ${this.escape(data[key], 'user', key)}`
    }).join(', ')
    await this.query(`UPDATE ?? SET ${assignments} WHERE ?? = ?`, ['user', type, id])
  },

  async getChannel(type, pid, fields) {
    if (Array.isArray(pid)) {
      if (fields && !fields.length) return pid.map(id => ({ id: `${type}:${id}` } as any))
      const placeholders = pid.map(() => '?').join(',')
      return this.select<Channel>('channel', fields, '`id` IN (' + placeholders + ')', pid.map(id => `${type}:${id}`))
    }
    if (fields && !fields.length) return { id: `${type}:${pid}` } as any
    const [data] = await this.select<Channel>('channel', fields, '`id` = ?', [`${type}:${pid}`])
    return data && { ...data, id: `${type}:${pid}` }
  },

  async getAssignedChannels(fields, assignMap = this.app.getSelfIds()) {
    return this.select<Channel>('channel', fields, Object.entries(assignMap).map(([type, ids]) => {
      return [
        `LEFT(\`id\`, ${type.length}) = ${this.escape(type)}`,
        `\`assignee\` IN (${ids.map(id => this.escape(id)).join(',')})`,
      ].join(' AND ')
    }).join(' OR '))
  },

  async removeChannel(type, pid) {
    await this.query('DELETE FROM `channel` WHERE `id` = ?', [`${type}:${pid}`])
  },

  async createChannel(type, pid, data) {
    data.id = `${type}:${pid}`
    const newKeys = Object.keys(data)
    if (!newKeys.length) return
    const assignments = difference(newKeys, ['id']).map((key) => {
      key = this.escapeId(key)
      return `${key} = VALUES(${key})`
    })
    const channel = Object.assign(Channel.create(type, pid), data)
    const keys = Object.keys(channel)
    console.log(assignments)
    await this.query(
      `INSERT INTO ?? (${this.joinKeys(keys)}) VALUES (${keys.map(() => '?').join(', ')})
      ON DUPLICATE KEY UPDATE ${assignments.join(', ')}`,
      ['channel', ...this.formatValues('channel', channel, keys)],
    )
  },

  async setChannel(type, pid, data) {
    data.id = `${type}:${pid}`
    const keys = Object.keys(data)
    if (!keys.length) return
    const assignments = difference(keys, ['id']).map((key) => {
      return `${this.escapeId(key)} = ${this.escape(data[key], 'channel', key)}`
    }).join(', ')
    await this.query(`UPDATE ?? SET ${assignments} WHERE ?? = ?`, ['channel', 'id', data.id])
  },
})

extendDatabase(MysqlDatabase, ({ tables, DataType }) => {
  tables.user = Object.assign<any, any>([
    'PRIMARY KEY (`id`) USING BTREE',
    'UNIQUE INDEX `name` (`name`) USING BTREE',
  ], {
    id: `BIGINT(20) UNSIGNED NOT NULL COMMENT 'QQ 号'`,
    name: `VARCHAR(50) NULL DEFAULT NULL COMMENT '昵称' COLLATE 'utf8mb4_general_ci'`,
    flag: `BIGINT(20) UNSIGNED NOT NULL DEFAULT '0' COMMENT '状态标签'`,
    authority: `TINYINT(4) UNSIGNED NOT NULL DEFAULT '0' COMMENT '权限等级'`,
    usage: new DataType.Json(),
    timers: new DataType.Json(),
  })

  tables.channel = Object.assign<any, any>([
    'PRIMARY KEY (`id`) USING BTREE',
  ], {
    id: `BIGINT(20) UNSIGNED NOT NULL COMMENT '群号'`,
    flag: `BIGINT(20) UNSIGNED NOT NULL DEFAULT '0' COMMENT '状态标签'`,
    assignee: `BIGINT(20) UNSIGNED NOT NULL DEFAULT '0'`,
  })
})

export const name = 'mysql'

export function apply(ctx: Context, config: Config = {}) {
  const db = new MysqlDatabase(ctx.app, config)
  ctx.database = db as Database
  ctx.before('connect', () => db.start())
  ctx.before('disconnect', () => db.stop())
}
