const TIMELINE_ID = "_timeLine";
const HLJS_CLASS = "hljs";
const EDITING_CLASS = "editing";

hljs.configure({ ignoreUnescapedHTML: true });

let lastEdited = null;

// ハイライトされてないcode要素（のspan）をすべて取得
function getNoHighlightBlocks() {
	const evaluateResult = document.evaluate(
		`//code/span[not(contains(@class, "${HLJS_CLASS}"))]`,
		document,
		null,
		XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
	);
	return [...Array(evaluateResult.snapshotLength)].map((_, i) =>
		evaluateResult.snapshotItem(i),
	);
}

function highlightAll() {
	const codeblocks = getNoHighlightBlocks();
	for (const codeblock of codeblocks) {
		hljs.highlightElement(codeblock);
		codeblock.style = "background-color:transparent";
	}

	const editingElement = document.evaluate(
		`//div[contains(@class, "${EDITING_CLASS}")]`,
		document,
		null,
		XPathResult.FIRST_ORDERED_NODE_TYPE,
	).singleNodeValue;

	// 変更終了時
	if (lastEdited && (!editingElement || editingElement.id !== lastEdited)) {
		const evaluateResult = document.evaluate(
			`//div[@id="${lastEdited}"]//code/span`,
			document,
			null,
			XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
		);
		const codeblocks = [...Array(evaluateResult.snapshotLength)].map((_, i) =>
			evaluateResult.snapshotItem(i),
		);

		for (const codeblock of codeblocks) {
			codeblock.removeAttribute("data-highlighted");
			codeblock.removeAttribute("class");
			hljs.highlightElement(codeblock);
			codeblock.style = "background-color:transparent";
		}

		lastEdited = null;
	}

	// 最後に変更してたエレメントのID
	if (editingElement) {
		lastEdited = editingElement.id;
	}
}

function main() {
	// DOMが読み込めてなかったら1秒後にリトライ
	if (!document.getElementById(TIMELINE_ID)) {
		setTimeout(main, 1000);
		return;
	}

	const observer = new MutationObserver(highlightAll);

	observer.observe(document.getElementById(TIMELINE_ID), {
		attributes: true,
		childList: true,
		subtree: true,
	});

	highlightAll();
}
main();
