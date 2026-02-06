import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0c 0%, #12121a 100%)',
        color: '#f5f0e6',
        fontFamily: "'Zen Kaku Gothic New', sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '20px 40px',
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '20px',
            fontWeight: 600,
            color: '#d4af37',
            textDecoration: 'none',
          }}
        >
          DrinkQR
        </Link>
      </header>

      {/* Content */}
      <main
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '60px 24px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '28px',
            marginBottom: '40px',
            color: '#f5f0e6',
          }}
        >
          プライバシーポリシー
        </h1>

        <div style={{ fontSize: '14px', lineHeight: 1.9, color: '#9a9a9a' }}>
          <p style={{ marginBottom: '24px' }}>
            DrinkQR（以下「当社」といいます。）は、本ウェブサイト上で提供するサービス（以下「本サービス」といいます。）における、お客様の個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第1条（個人情報）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第2条（個人情報の収集方法）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            当社は、お客様が利用登録をする際に氏名、メールアドレス、店舗名などの個人情報をお尋ねすることがあります。また、お客様と提携先などとの間でなされたお客様の個人情報を含む取引記録や決済に関する情報を、当社の提携先（情報提供元、広告主、広告配信先などを含みます。以下「提携先」といいます。）などから収集することがあります。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第3条（個人情報を収集・利用する目的）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            当社が個人情報を収集・利用する目的は、以下のとおりです。
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>本サービスの提供・運営のため</li>
            <li>お客様からのお問い合わせに回答するため（本人確認を行うことを含む）</li>
            <li>お客様が利用中のサービスの新機能、更新情報、キャンペーン等及び当社が提供する他のサービスの案内のメールを送付するため</li>
            <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
            <li>利用規約に違反したお客様や、不正・不当な目的でサービスを利用しようとするお客様の特定をし、ご利用をお断りするため</li>
            <li>お客様にご自身の登録情報の閲覧や変更、削除、ご利用状況の閲覧を行っていただくため</li>
            <li>有料サービスにおいて、お客様に利用料金を請求するため</li>
            <li>上記の利用目的に付随する目的</li>
          </ul>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第4条（利用目的の変更）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 当社は、利用目的が変更前と関連性を有すると合理的に認められる場合に限り、個人情報の利用目的を変更するものとします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. 利用目的の変更を行った場合には、変更後の目的について、当社所定の方法により、お客様に通知し、または本ウェブサイト上に公表するものとします。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第5条（個人情報の第三者提供）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 当社は、次に掲げる場合を除いて、あらかじめお客様の同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
            <li>予め次の事項を告知あるいは公表し、かつ当社が個人情報保護委員会に届出をしたとき</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            2. 前項の定めにかかわらず、次に掲げる場合には、当該情報の提供先は第三者に該当しないものとします。
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>当社が利用目的の達成に必要な範囲内において個人情報の取扱いの全部または一部を委託する場合</li>
            <li>合併その他の事由による事業の承継に伴って個人情報が提供される場合</li>
            <li>個人情報を特定の者との間で共同して利用する場合であって、その旨並びに共同して利用される個人情報の項目、共同して利用する者の範囲、利用する者の利用目的および当該個人情報の管理について責任を有する者の氏名または名称について、あらかじめ本人に通知し、または本人が容易に知り得る状態に置いた場合</li>
          </ul>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第6条（個人情報の開示）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
          </p>
          <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
            <li>本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
            <li>当社の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
            <li>その他法令に違反することとなる場合</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            2. 前項の定めにかかわらず、履歴情報および特性情報などの個人情報以外の情報については、原則として開示いたしません。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第7条（個人情報の訂正および削除）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. お客様は、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除（以下「訂正等」といいます。）を請求することができます。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. 当社は、お客様から前項の請求を受けてその請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の訂正等を行うものとします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            3. 当社は、前項の規定に基づき訂正等を行った場合、または訂正等を行わない旨の決定をしたときは遅滞なく、これをお客様に通知します。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第8条（個人情報の利用停止等）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 当社は、本人から、個人情報が利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」といいます。）を求められた場合には、遅滞なく必要な調査を行います。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. 前項の調査結果に基づき、その請求に応じる必要があると判断した場合には、遅滞なく、当該個人情報の利用停止等を行います。
          </p>
          <p style={{ marginBottom: '16px' }}>
            3. 当社は、前項の規定に基づき利用停止等を行った場合、または利用停止等を行わない旨の決定をしたときは、遅滞なく、これをお客様に通知します。
          </p>
          <p style={{ marginBottom: '16px' }}>
            4. 前2項にかかわらず、利用停止等に多額の費用を有する場合その他利用停止等を行うことが困難な場合であって、お客様の権利利益を保護するために必要なこれに代わるべき措置をとれる場合は、この代替策を講じるものとします。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第9条（Cookieの使用）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            当社のサービスでは、Cookieを使用しています。Cookieは、お客様のブラウザに保存される小さなテキストファイルで、サービスの利便性向上、アクセス解析などに使用されます。お客様はブラウザの設定によりCookieの受け入れを拒否することができますが、その場合、サービスの一部機能が利用できなくなる可能性があります。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第10条（プライバシーポリシーの変更）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            1. 本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、お客様に通知することなく、変更することができるものとします。
          </p>
          <p style={{ marginBottom: '16px' }}>
            2. 当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
          </p>

          <h2 style={{ fontSize: '18px', color: '#f5f0e6', margin: '40px 0 16px', fontWeight: 600 }}>
            第11条（お問い合わせ窓口）
          </h2>
          <p style={{ marginBottom: '16px' }}>
            本ポリシーに関するお問い合わせは、本サービス内のお問い合わせフォームよりご連絡ください。
          </p>

          <p style={{ marginTop: '60px', color: '#6a6a6a' }}>
            制定日：2025年1月31日
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: '40px 24px',
          borderTop: '1px solid #2a2a36',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginBottom: '16px' }}>
          <Link href="/" style={{ color: '#6a6a6a', textDecoration: 'none', fontSize: '13px' }}>
            トップ
          </Link>
          <Link href="/terms" style={{ color: '#6a6a6a', textDecoration: 'none', fontSize: '13px' }}>
            利用規約
          </Link>
        </div>
        <div style={{ color: '#4a4a4a', fontSize: '12px' }}>
          © 2025 DrinkQR
        </div>
      </footer>
    </div>
  );
}
