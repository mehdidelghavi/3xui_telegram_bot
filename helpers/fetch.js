exports.getXui = async (data) => {
    const res = await fetch(data.url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${data.token}`,
            Accept: "application/json"
        }
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

exports.postXui = async (data) => {
    const res = await fetch(data.url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${data.token}`,
            Accept: "application/json"
        },
        body: JSON.stringify(data.body)
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}