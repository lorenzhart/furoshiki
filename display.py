#coding:utf-8
from amazon import Amazon

# キーワードで本を検索したい！
amazon = Amazon("1CKS3GAAG9JX0S6Q3A82", "JPxz1529wld62vzNO6HHEReYukSeYVNo4pLkqPw9")
xml = amazon.itemSearch("Books", Keywords="人工知能", ItemPage="1")  # 本
print amazon.url  # リクエストURL
#print xml        # Amazonのレスポンス

# XMLから情報を取り出す
from BeautifulSoup import BeautifulStoneSoup
soup = BeautifulStoneSoup(xml)

items = soup.find("items")
print "%s件見つかりました" % soup.find("totalresults").contents[0]
total_pages = soup.find("totalpages").contents[0]
cur_page = soup.find("itempage").contents[0]
print "ページ数: %s/%s" % (cur_page, total_pages)

for item in soup.findAll("item"):
    print item.asin.contents[0], item.author.contents[0], item.title.contents[0]