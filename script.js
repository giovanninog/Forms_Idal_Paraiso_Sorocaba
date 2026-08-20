document.addEventListener("DOMContentLoaded", () => {

    const cnpjInput = document.getElementById("cnpj");
    const telefoneInput = document.getElementById("telefone");

    // Máscara CNPJ
    cnpjInput.addEventListener("input", function (e) {

        let x = e.target.value.replace(/\D/g, "");

        if (x.length > 14) x = x.slice(0, 14);

        x = x.replace(/^(\d{2})(\d)/, "$1.$2");
        x = x.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        x = x.replace(/\.(\d{3})(\d)/, ".$1/$2");
        x = x.replace(/(\d{4})(\d)/, "$1-$2");

        e.target.value = x;
    });

    // Máscara Telefone
    telefoneInput.addEventListener("input", function (e) {

        let x = e.target.value.replace(/\D/g, "");

        if (x.length > 11) x = x.slice(0, 11);

        x = x.replace(/^(\d{2})(\d)/, "($1) $2");

        if (x.length > 10) {
            x = x.replace(/(\d{5})(\d)/, "$1-$2");
        } else {
            x = x.replace(/(\d{4})(\d)/, "$1-$2");
        }

        e.target.value = x;
    });

});

function valor(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value.trim() : "";
}

async function gerarPDFDenuncia(event) {

    event.preventDefault();

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    // =========================
    // CAPTURA DOS DADOS
    // =========================

    const tiposDenuncia = Array.from(
        document.querySelectorAll('input[name="tipo_denuncia"]:checked')
    )
        .map(item => item.value)
        .join(", ");

    const genero =
        document.querySelector('input[name="genero"]:checked')?.value ||
        "Não informado";

    const dados = {
        cnpj: valor("cnpj"),
        local: valor("local_incidente"),
        nome: valor("nome_denunciante"),
        nomeSocial: valor("nome_social"),
        telefone: valor("telefone"),
        email: valor("email"),
        denunciado: valor("nome_denunciado"),
        cargo: valor("cargo_denunciado"),
        setor: valor("setor_denunciado"),
        narracao: valor("narracao_fatos"),
        aconteceu: valor("o_que_aconteceu"),
        forma: valor("forma_ocorrido"),
        frequencia: valor("frequencia"),
        testemunhas: valor("testemunhas"),
        consequencias: valor("consequencias"),
        dataHorario: valor("data_horario"),
        observacoes: valor("observacoes")
    };

    // =========================
    // CABEÇALHO
    // =========================

    doc.setFillColor(0, 70, 140);
    doc.rect(0, 0, 210, 25, "F");

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");

    doc.text(
        "COMISSÃO INTERNA DE PREVENÇÃO DE ACIDENTES E ASSÉDIO",
        105,
        10,
        { align: "center" }
    );

    doc.setFontSize(11);

    doc.text(
        "FORMULÁRIO DE DENÚNCIA",
        105,
        18,
        { align: "center" }
    );

    doc.setTextColor(0, 0, 0);

    // =========================
    // DADOS GERAIS
    // =========================

    doc.autoTable({
        startY: 35,
        theme: "grid",
        head: [["Dados de Denúncia", "Informação"]],
        body: [
            ["Tipo de denúncia", tiposDenuncia || "Não informado"],
            ["CNPJ", dados.cnpj || "Não informado"],
            ["Local do incidente", dados.local || "Não informado"]
        ]
    });

    // =========================
    // DENUNCIANTE
    // =========================

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 8,
        theme: "grid",
        head: [["DADOS DO DENUNCIANTE", ""]],
        body: [
            ["Nome", dados.nome],
            ["Nome Social", dados.nomeSocial || "-"],
            ["Telefone", dados.telefone],
            ["E-mail", dados.email],
            ["Gênero", genero]
        ]
    });

    // =========================
    // DENUNCIADO
    // =========================

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 8,
        theme: "grid",
        head: [["DADOS DO DENUNCIADO", ""]],
        body: [
            ["Nome", dados.denunciado],
            ["Cargo/Função", dados.cargo],
            ["Setor", dados.setor]
        ]
    });

    // =========================
    // SEGUNDA PÁGINA
    // =========================

    doc.addPage();

    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("RELATO DOS FATOS", 15, 20);

    doc.autoTable({
        startY: 30,
        theme: "grid",
        body: [
            ["Narração dos fatos:", dados.narracao],
            ["O que aconteceu?", dados.aconteceu],
            ["Forma de ocorrência:", dados.forma],
            ["Frequência:", dados.frequencia],
            ["Testemunhas:", dados.testemunhas],
            ["Consequências:", dados.consequencias],
            ["Data e horário:", dados.dataHorario],
            ["Observações:", dados.observacoes || "-"]
        ],
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 130 }
        }
    });

// =========================
// RODAPÉ FIXO DA SEGUNDA PÁGINA
// =========================

const alturaPagina = doc.internal.pageSize.getHeight();

// Linha separadora
doc.setDrawColor(180, 180, 180);
doc.line(
    15,
    alturaPagina - 45,
    195,
    alturaPagina - 45
);

// Título
doc.setFontSize(9);
doc.setFont(undefined, "bold");

doc.text(
    "DECLARAÇÃO",
    15,
    alturaPagina - 37
);

// Texto da declaração
doc.setFont(undefined, "normal");

const textoDeclaracao = doc.splitTextToSize(
    "Declaro que as informações fornecidas neste formulário são verdadeiras e assumo total responsabilidade pelo conteúdo informado.",
    180
);

doc.text(
    textoDeclaracao,
    15,
    alturaPagina - 31
);

// Rodapé
doc.setFontSize(8);

doc.text(
    `Documento gerado em: ${new Date().toLocaleString("pt-BR")}`,
    15,
    alturaPagina - 10
);

doc.text(
    "(NOME DA EMPRESA)",
    195,
    alturaPagina - 10,
    { align: "right" }
);

    doc.save("Formulario_Denuncia.pdf");
}