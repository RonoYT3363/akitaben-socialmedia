// ================================
// 相対時間フォーマット関数
// ================================
function formatRelativeTime(date) {
    const now = new Date();
    const diff = (now - date) / 1000;

    if (diff <= 5) return "たった今";
    if (diff < 60) return Math.floor(diff) + "秒前";

    const minutes = diff / 60;
    if (minutes < 60) return Math.floor(minutes) + "分前";

    const hours = minutes / 60;
    if (hours < 24) return Math.floor(hours) + "時間前";

    const days = hours / 24;
    if (days < 30) return Math.floor(days) + "日前";

    const months = days / 30;
    if (months < 12) return Math.floor(months) + "か月前";

    const years = months / 12;
    return Math.floor(years) + "年前";
}

// ================================
// 画像アップロード（Storage）
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const imageButton = document.getElementById("imageButton");
    const imageInput = document.getElementById("imageInput");

    if (imageButton && imageInput) {
        imageButton.addEventListener("click", () => {
            imageInput.click();
        });
    }
});

async function uploadImage(file) {
    return new Promise(async (resolve, reject) => {
        if (!file) return resolve(null); // 画像なし投稿OK

        const storageRef = storageFunctions.ref(storage, "images/" + Date.now() + "_" + file.name);

        try {
            await storageFunctions.uploadBytes(storageRef, file);
            const url = await storageFunctions.getDownloadURL(storageRef);
            resolve(url);
        } catch (e) {
            console.error("画像アップロードエラー:", e);
            reject(e);
        }
    });
}

// ================================
// 投稿処理（文章だけ・画像だけ・両方OK）
// ================================
async function addPost() {
    const input = document.getElementById("postInput");
    const fileInput = document.getElementById("imageInput");

    const text = input.value.trim();
    const file = fileInput.files[0];

    // 文章も画像もない → 投稿不可
    if (text.length === 0 && !file) {
        alert("文章または画像を入力してください");
        return;
    }

    try {
        let imageUrl = null;

        if (file) {
            imageUrl = await uploadImage(file);
        }

        await firestoreFunctions.addDoc(
            firestoreFunctions.collection(db, "posts"),
            {
                text: text.length > 0 ? text : null,
                imageUrl: imageUrl,
                createdAt: firestoreFunctions.serverTimestamp()
            }
        );

        input.value = "";
        fileInput.value = "";
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

            // テキストがある場合のみ表示
            if (data.text) {
                const text = document.createElement("p");
                text.textContent = data.text;
                post.appendChild(text);
            }

            // 画像がある場合は表示
            if (data.imageUrl) {
                const img = document.createElement("img");
                img.src = data.imageUrl;
                img.className = "postImage";
                post.appendChild(img);
            }

            const time = document.createElement("span");
            time.className = "time";

            if (data.createdAt) {
                const date = data.createdAt.toDate();
                time.textContent = formatRelativeTime(date);
            } else {
                time.textContent = "送信中…";
            }

            post.appendChild(time);
            posts.appendChild(post);
        });
    });
});
