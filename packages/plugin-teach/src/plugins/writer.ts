import { Context, User } from 'koishi-core'
import { deduplicate } from 'koishi-utils'
import { Dialogue } from '../utils'

declare module '../utils' {
  interface DialogueTest {
    writer?: number
    frozen?: boolean
  }

  interface Dialogue {
    writer: number
  }

  namespace Dialogue {
    interface Argv {
      writer?: number
      nameMap?: Record<number, string>
      /** 用于保存用户权限的键值对，键的范围包括目标问答列表的全体作者以及 -w 参数 */
      authMap?: Record<number, number>
    }

    interface Config {
      useWriter?: boolean
    }
  }
}

export default function apply(ctx: Context, config: Dialogue.Config) {
  if (config.useWriter === false) return
  const { authority } = config

  ctx.command('teach')
    .option('frozen', '-f  锁定这个问答', { authority: authority.frozen })
    .option('frozen', '-F, --no-frozen  解锁这个问答', { authority: authority.frozen, value: false })
    .option('writer', '-w <uid:user>  添加或设置问题的作者')
    .option('writer', '-W, --anonymous  添加或设置匿名问题', { authority: authority.writer, value: '0' })

  ctx.emit('dialogue/flag', 'frozen')

  ctx.before('dialogue/detail', async (argv) => {
    argv.nameMap = {}
    argv.authMap = {}
    const { options, nameMap, session, dialogues, authMap } = argv
    const writers = deduplicate(dialogues.map(d => d.writer).filter(Boolean))
    const fields: User.Field[] = ['id', 'authority', session.platform]
    if (options.writer === '0') {
      argv.writer = 0
    } else if (options.writer && !writers.includes(options.writer)) {
      const user = await ctx.database.getUser(session.platform, options.writer, fields) as any
      if (user) {
        writers.push(user.id)
        argv.writer = user.id
      }
    }
    if (!options.modify) fields.push('name')
    const users = await ctx.database.getUser('id', writers, fields)

    let hasUnnamed = false
    const idMap: Record<string, number> = {}
    for (const user of users) {
      authMap[user.id] = user.authority
      if (options.modify) continue
      const userId = user[session.platform]
      if (user.name) {
        nameMap[user.id] = `${user.name} (${userId})`
      } else if (userId === session.userId) {
        nameMap[user.id] = `${session.author.nickname || session.author.username} (${session.userId})`
      } else {
        hasUnnamed = true
        idMap[userId] = user.id
      }
    }

    if (!options.modify && hasUnnamed && session.subtype === 'group') {
      try {
        const memberMap = await session.$bot.getGroupMemberMap(session.groupId)
        for (const userId in memberMap) {
          nameMap[idMap[userId]] ||= memberMap[userId]
        }
      } catch { }
    }
  })

  ctx.on('dialogue/detail', ({ writer, flag }, output, argv) => {
    if (flag & Dialogue.Flag.frozen) output.push('此问答已锁定。')
    if (writer) {
      const name = argv.nameMap[writer]
      output.push(name ? `来源：${name}` : `来源：未知用户`)
    }
  })

  // 当修改问答时，如果问答的作者不是本人，需要 admin 级权限
  // 当添加和修改问答时，如果问答本身是代行模式或要将问答设置成代行模式，则需要权限高于问答原作者
  // 当使用 -w 时需要原作者权限高于目标用户
  // 锁定的问答需要 frozen 级权限才能修改
  ctx.on('dialogue/permit', ({ session, target, options, authMap }, { writer, flag }) => {
    const { writer: newWriter } = options
    const { id, authority } = session.$user
    return (
      (newWriter && authority <= authMap[newWriter] && newWriter !== id) ||
      ((flag & Dialogue.Flag.frozen) && authority < config.authority.frozen) ||
      (writer !== id && target && authority < config.authority.admin)
    )
  })

  ctx.on('dialogue/detail-short', ({ flag }, output) => {
    if (flag & Dialogue.Flag.frozen) output.push('锁定')
  })

  ctx.before('dialogue/search', ({ writer }, test) => {
    test.writer = writer
  })

  ctx.before('dialogue/modify', async ({ writer, options }) => {
    if (options.writer && typeof writer === 'undefined') return '指定的目标用户不存在。'
  })

  ctx.on('dialogue/modify', ({ writer, session, target }, data) => {
    if (typeof writer !== 'undefined') {
      data.writer = writer
    } else if (!target) {
      data.writer = session.$user.id
    }
  })
}
