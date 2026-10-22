
const formular = document.querySelector("#formular");
const mesajForm = document.querySelector("#mesaj-form");
const status = document.querySelector("#status");
const lista = document.querySelector("#lista");
const cautare = document.querySelector("#cautare");

const url = "https://jsonplaceholder.typicode.com/posts";

let postari = [];

function afiseazaPostari(postariDeAfisat) {
    lista.replaceChildren();
    if (postariDeAfisat.length === 0) {
        if (cautare.value.trim() !== "") {
            status.textContent = "Nu am gasit postari.";
        } else {
            status.textContent = "Nu exista postari.";
        }
        return;
    }

    status.textContent = "";
    postariDeAfisat.forEach(function(postare) {
        const element = document.createElement("li");
        const titluPostare = document.createElement("h2");
        const textPostare = document.createElement("p");
        titluPostare.textContent = postare.title;
        textPostare.textContent = postare.body;
        element.append(titluPostare, textPostare);
        lista.appendChild(element);
    });
}

async function incarcaPostari() {
    status.textContent = "Se incarca...";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Eroare la incarcarea postarilor.");
        }
        postari = await response.json();
        afiseazaPostari(postari);
    }catch(eroare) {
        status.textContent = "Nu s-au putut incarca postarile.";
    }
}

formular.addEventListener("submit", async function(event) {
    event.preventDefault();
    mesajForm.textContent = "";
    const dateFormular = new FormData(formular);
    const postareNoua = {
        title: dateFormular.get("title"),
        body: dateFormular.get("body"),
        userId: 1
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(postareNoua)
        });

        if (!response.ok) {
            const eroareServer = await response.json().catch(function() {
                return null;
            });

            throw new Error(
                eroareServer?.message ||
                "Serverul a refuzat postarea. Cod: " + response.status
            );
        }

        if (response.status !== 201) {
            throw new Error("Postarea nu a fost creata.");
        }

        const postareCreata = await response.json();

        postari.unshift(postareCreata);
        cautare.value = "";
        afiseazaPostari(postari);

        mesajForm.textContent = "Postarea a fost adaugata cu succes!";
        formular.reset();

    } catch (eroare) {
        mesajForm.textContent =
            eroare instanceof TypeError
                ? "Eroare de retea. Incearca din nou."
                : eroare.message;
    }
});

cautare.addEventListener("input", function() {
    const textCautat = cautare.value.toLowerCase();
    const rezultate = postari.filter(function(postare) {
        return postare.title.toLowerCase().includes(textCautat);
    });

    afiseazaPostari(rezultate);
});

incarcaPostari();
