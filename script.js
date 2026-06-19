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
async function uploadImage(file) {
    if (!file) return null;

    const storageRef = storageFunctions.ref(
        storage,
        "images/" + Date.now() + "_" + file.name
    );

    await storageFunctions.uploadBytes(storageRef, file);
    const url = await storageFunctions.getDownloadURL(storageRef);

    return url;
}

// ================================
// 投稿処理（文章だけ・画像だけ・両方OK）
// ================================
async function addPost() {
    const input = document.getElementById("postInput");
    const fileInput = document.getElementById("imageInput");

    const text = input.value.trim();
    const file = fileInput.files[0];

    if (!text && !file) {
        alert("文章または画像を入力してください");
        return;
    }

    let imageUrl = null;
    if (file) {
        imageUrl = await uploadImage(file);
    }

    await firestoreFunctions.addDoc(
        firestoreFunctions.collection(db, "posts"),
        {
            text: text || null,
            imageUrl: imageUrl || null,
            createdAt: firestoreFunctions.serverTimestamp()
        }
    );

    input.value = "";
    fileInput.value = "";
}

// HTML から addPost() を呼べるようにする
window.addPost = addPost;

// ================================
// 写真ボタン → input を開く
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

            if (data.text) {
                const text = document.createElement("p");
                text.textContent = data.text;
                post.appendChild(text);
            }

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

// ================================
// Enterキーで投稿
// ================================
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("postInput");

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.shiftKey) return;

        if (e.key === "Enter") {
            e.preventDefault();
            addPost();
        }
    });
});
