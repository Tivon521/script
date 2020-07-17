import time

import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36 QIHU 360SE'
}


def get_answer(qid, offset):
    # 利用知乎 API 请求 json 数据
    # qid: 知乎问题号
    # offset: 第几页
    # 知乎 API
    url = "https://www.zhihu.com/api/v4/questions/{}/answers?include=voteup_count&limit=20&offset={}&platform=desktop&sort_by=default".format(
        qid, offset)
    res = requests.get(url, headers=headers)
    res.encoding = 'utf-8'
    return res.json()


# 获取所有书籍和回答数据
def get_rank_and_like(qid, aid):
    offset = 0
    rank = 0
    while True:
        qid = qid
        print('Offset =', offset)
        # 知乎 api 请求
        data = get_answer(qid, offset)
        # print(data)
        if len(data['data']) == 0:
            return offset, "-1"
        if offset > 100:
            return "100+", "-1"

        ## 找对应答案的排名
        for item in data["data"]:
            rank += 1
            answer_id = item["id"]
            voteup_count = item['voteup_count']
            if str(answer_id) == aid:
                return rank, voteup_count

        offset += 20
        time.sleep(3)  # 防止被风控


if __name__ == "__main__":
    print(get_rank_and_like('287500965', '1332349585'))
