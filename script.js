async function addPost() {

    const input = document.getElementById("postInput");

    const text = input.value.trim();

    if (text === "") {
        alert("投稿内容を入力してください");
        return;
    }

    await firestoreFunctions.addDoc(
        firestoreFunctions.collection(db, "posts"),
        {
            text: text,
            createdAt: firestoreFunctions.serverTimestamp()
        }
    );

    input.value = "";
}

window.addEventListener("load", () => {

    const posts = document.getElementById("posts");

    const q = firestoreFunctions.query(
        firestoreFunctions.collection(db, "posts"),
        firestoreFunctions.orderBy("createdAt", "desc")
    );

    firestoreFunctions.onSnapshot(q, (snapshot) => {

        posts.innerHTML = "";

        snapshot.forEach((doc) => {

            const post = document.createElement("div");

            post.className = "post";
            post.textContent = doc.data().text;

            posts.appendChild(post);

        });

    });

});
