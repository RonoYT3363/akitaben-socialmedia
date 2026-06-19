// ================================
// 相対時間フォーマット関数
// ================================
function formatRelativeTime(date) {
    const now = new Date();
    const diff = (now - date) / 1000; // 秒差

    if (diff <= 5) {
        return "たった今";
    }

    if (diff < 60) {
        return Math.floor(diff) + "秒前";
    }

    const minutes = diff / 60;
    if (minutes < 60) {
        return Math.floor(minutes) + "分前";
    }

    const hours = minutes / 60;
    if (hours < 24) {
        return Math.floor(hours) + "時間前";
    }

    const days = hours / 24;
    if (days < 30) {
        return Math.floor(days) + "日前";
    }

    const months = days / 30;
    if (months < 12) {
        return Math.floor(months) + "か月前";
    }

    const years = months / 12;
    return Math.floor(years) + "年前";
}

// ================================
// 投稿処理（空白投稿禁止 + 投稿後クリア）
// ================================
async function addPost() {
    const input = document.getElementById("postInput");
    const text = input.value;

    // 空白・改行だけの投稿を禁止
    if (!text || text.trim().length === 0) {
        alert("投稿内容を入力してください");
        return;
    }

    try {
        await firestoreFunctions.addDoc(
            firestoreFunctions.collection(db, "posts"),
            {
                text: text.trim(),
                createdAt: firestoreFunctions.serverTimestamp()
            }
        );

        // 投稿後に入力欄をクリア
        input.value = "";

        // 投稿後にフォーカスを戻す
        input.focus();

    } catch (e) {
        console.error("投稿エラー:", e);
        alert("投稿に失敗しました");
    }
}

// ================================
// Enterキーで投稿（Shift+Enter は改行）
// ================================
document.getElementById("postInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        addPost();
    }
});

// ================================
// Firestore リアルタイム取得
// ================================
window.addEventListener("load", () => {
    const posts = document.getElementById("posts");

    const q = firestoreFunctions.query(
        firestoreFunctions.collection(db, "posts"),
        firestoreFunctions.orderBy("createdAt", "desc")
    );

    firestoreFunctions.onSnapshot(q, (snapshot) => {
        posts.innerHTML = "";

        snapshot.forEach((doc) => {
            const data = doc.data();

            const post = document.createElement("div");
            post.className = "post";

            const text = document.createElement("p");
            text.textContent = data.text;

            const time = document.createElement("span");
            time.className = "time";

            if (data.createdAt) {
                const date = data.createdAt.toDate();
                time.textContent = formatRelativeTime(date);
            } else {
                time.textContent = "送信中…";
            }

            post.appendChild(text);
            post.appendChild(time);

            posts.appendChild(post);
        });
    });
});
