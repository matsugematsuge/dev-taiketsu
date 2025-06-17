let multipliersData = {};
let incentiveLevels = {}; // インセンティブレベルを保存するオブジェクト

// インセンティブと対決の達人のデータ
const incentiveData = {
    "インセンティブ：レーダー": 10,
    "インセンティブ：加速": 10,
    "インセンティブ：募集": 10,
    "対決の達人": 20, // 達人
    "インセンティブ：施設": 10,
    "インセンティブ：科学": 10,
    "インセンティブ：訓練": 10,
    "インセンティブ：敵討伐": 10,
    "インセンティブ：基地間貿易": 10,
    "インセンティブ：隠密機動隊": 10,
    "インセンティブ：生存者募集": 10,
    "対決の達人Ⅱ": 10 // 達人Ⅱ
};

document.addEventListener('DOMContentLoaded', () => {
    fetch('multipliers.json')
        .then(response => response.json())
        .then(data => {
            multipliersData = data;
            // ページロード時にインセンティブレベルを初期化またはロードする
            initializeIncentiveSettings();
            loadIncentiveLevels(); // 保存されたレベルを読み込む（initializeIncentiveSettingsの後に）
            populateDayItems(); // アイテム表示と初期ポイント計算
        })
        .catch(error => console.error('Error loading multipliers data:', error));

    document.getElementById('dayOfWeek').addEventListener('change', populateDayItems);
});

function openTab(evt, tabName) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    const tabButtons = document.getElementsByClassName("tab-button");
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function populateDayItems() {
    const day = document.getElementById('dayOfWeek').value;
    const itemsContainer = document.getElementById('itemsContainer');
    itemsContainer.innerHTML = '';

    if (multipliersData[day]) {
        for (const itemName in multipliersData[day]) {
            const item = multipliersData[day][itemName];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item');

            const itemLabel = document.createElement('span');
            itemLabel.classList.add('item-label');
            itemLabel.textContent = itemName;
            itemDiv.appendChild(itemLabel);

            const itemControls = document.createElement('div');
            itemControls.classList.add('item-controls');

            const input = document.createElement('input');
            input.type = 'number';
            input.value = 0;
            input.min = 0;
            // placeholderは固定で'分'、'数量'、'回数'
            input.placeholder = (item.input_unit_type === 'time' ? '分' : (item.per_value ? '数量' : '回数'));
            input.dataset.itemName = itemName;
            input.dataset.multiplier = item.multiplier;
            input.dataset.perValue = item.per_value || 1; // per_valueがない場合は1として扱う
            input.dataset.inputUnitType = item.input_unit_type || 'quantity'; // input_unit_typeがない場合はquantityとして扱う
            input.addEventListener('input', calculateTotalPoints);
            itemControls.appendChild(input);

            // 単位選択のプルダウンを追加 (default_unitが'none'以外の場合、または時間タイプの場合)
            if (item.default_unit !== 'none' || item.input_unit_type === 'time') {
                const unitSelect = document.createElement('select');
                unitSelect.dataset.itemName = itemName; // どの項目の単位か識別するため
                unitSelect.classList.add('unit-select');

                // 時間単位の場合
                if (item.input_unit_type === 'time') {
                    const timeUnits = {
                        'minute': '分',
                        'hour': '時間',
                        'day': '日'
                    };
                    for (const unitKey in timeUnits) {
                        const option = document.createElement('option');
                        option.value = unitKey;
                        option.textContent = timeUnits[unitKey];
                        unitSelect.appendChild(option);
                    }
                    // デフォルトで「分」を選択
                    unitSelect.value = 'minute';
                } else { // 通常の数量単位の場合 (multipliers.jsonのunit_factorsから取得)
                    const quantityUnits = Object.keys(multipliersData.unit_factors).filter(unit =>
                        unit === 'none' || unit === 'K' || unit === 'M' || unit === 'G'
                    );
                    quantityUnits.forEach(unit => {
                        const option = document.createElement('option');
                        option.value = unit;
                        option.textContent = unit;
                        unitSelect.appendChild(option);
                    });
                    unitSelect.value = item.default_unit; // JSONで指定されたデフォルト単位を選択
                }
                unitSelect.addEventListener('change', calculateTotalPoints);
                itemControls.appendChild(unitSelect);
            }

            itemDiv.appendChild(itemControls);
            itemsContainer.appendChild(itemDiv);
        }
    }
    calculateTotalPoints(); // 項目がロードされたら合計ポイントを計算
}

function calculateTotalPoints() {
    let total = 0;
    const day = document.getElementById('dayOfWeek').value;
    const items = document.querySelectorAll('#itemsContainer .item input');

    items.forEach(input => {
        const itemName = input.dataset.itemName;
        const item = multipliersData[day][itemName];
        const value = parseFloat(input.value) || 0;
        let points = 0;

        // 単位の選択を考慮
        let currentUnitFactor = multipliersData.unit_factors[item.default_unit]; // デフォルトの単位ファクター
        const unitSelect = input.parentNode.querySelector('.unit-select'); // 同じ親要素内の単位選択プルダウンを探す

        if (unitSelect && multipliersData.unit_factors[unitSelect.value]) {
            currentUnitFactor = multipliersData.unit_factors[unitSelect.value];
        }

        if (item.input_unit_type === 'time') {
            points = value * item.multiplier * currentUnitFactor;
        } else if (item.per_value) {
            points = (value / item.per_value) * item.multiplier * currentUnitFactor;
        } else {
            points = value * item.multiplier * currentUnitFactor;
        }

        // カテゴリーに基づいてインセンティブボーナスを適用
        if (item.category && Array.isArray(item.category)) {
            item.category.forEach(cat => {
                const incentiveKey = getIncentiveKey(cat);
                if (incentiveKey && incentiveLevels[incentiveKey] !== undefined) { // incentiveKeyが存在し、レベルが設定されているか確認
                    const bonusPercentage = incentiveLevels[incentiveKey] / 100;
                    points *= (1 + bonusPercentage);
                }
            });
        }
        total += points;
    });

    document.getElementById('totalPoints').textContent = Math.round(total).toLocaleString();
}

// カテゴリー名をインセンティブ設定のキーにマッピングするヘルパー関数
function getIncentiveKey(category) {
    switch (category) {
        case "レーダー": return "インセンティブ：レーダー";
        case "加速": return "インセンティブ：加速";
        case "募集": return "インセンティブ：募集";
        case "施設": return "インセンティブ：施設";
        case "科学": return "インセンティブ：科学";
        case "訓練": return "インセンティブ：訓練";
        case "敵討伐": return "インセンティブ：敵討伐";
        case "基地間貿易": return "インセンティブ：基地間貿易";
        case "隠密機動隊": return "インセンティブ：隠密機動隊";
        case "生存者募集": return "インセンティブ：生存者募集";
        case "達人": return "対決の達人";
        case "達人Ⅱ": return "対決の達人Ⅱ";
        // "なし" のカテゴリーはインセンティブの対象外と見なす
        case "なし": return null;
        default: return null;
    }
}

function initializeIncentiveSettings() {
    const incentiveOptionsContainer = document.getElementById('incentiveOptions');
    incentiveOptionsContainer.innerHTML = '';

    for (const incentiveName in incentiveData) {
        const maxLevel = incentiveData[incentiveName];
        const incentiveGroupDiv = document.createElement('div');
        incentiveGroupDiv.classList.add('incentive-group');

        const label = document.createElement('label');
        label.textContent = incentiveName;
        incentiveGroupDiv.appendChild(label);

        const select = document.createElement('select');
        // IDの sanitization を改善 (全角スペースも考慮)
        select.id = `incentive-${incentiveName.replace(/[:：\s]/g, '_')}-level`;
        select.dataset.incentiveName = incentiveName;

        // Lv.0 (0%) を最初に追加
        const zeroOption = document.createElement('option');
        zeroOption.value = 0;
        zeroOption.textContent = `Lv.0 (0%)`;
        select.appendChild(zeroOption);

        for (let i = 1; i <= maxLevel; i++) {
            const option = document.createElement('option');
            option.value = i * 5; // Lv.1 = 5%, Lv.2 = 10% ...
            option.textContent = `Lv.${i} (${i * 5}%)`;
            select.appendChild(option);
        }

        // デフォルトで最大Lvを選択
        // Lv.0も考慮に入れるため、デフォルト値は明示的に設定する
        select.value = maxLevel * 5;
        // 初期化時に incentiveLevels オブジェクトにデフォルト値を設定
        incentiveLevels[incentiveName] = maxLevel * 5;

        // 変更イベントリスナーを追加
        select.addEventListener('change', (event) => {
            const selectedLevel = parseInt(event.target.value);
            const name = event.target.dataset.incentiveName;
            incentiveLevels[name] = selectedLevel;
            saveIncentiveLevels(); // レベルを保存
            calculateTotalPoints(); // 合計ポイントを再計算
        });

        incentiveGroupDiv.appendChild(select);
        incentiveOptionsContainer.appendChild(incentiveGroupDiv);
    }
}

// インセンティブレベルをLocalStorageに保存する関数
function saveIncentiveLevels() {
    localStorage.setItem('incentiveLevels', JSON.stringify(incentiveLevels));
}

// 保存されたインセンティブレベルを読み込む関数
function loadIncentiveLevels() {
    const savedLevels = localStorage.getItem('incentiveLevels');
    if (savedLevels) {
        incentiveLevels = JSON.parse(savedLevels);
        // ロードしたレベルをプルダウンに反映
        for (const incentiveName in incentiveLevels) {
            // IDの sanitization も保存時と同じルールを適用
            const selectId = `incentive-${incentiveName.replace(/[:：\s]/g, '_')}-level`;
            const selectElement = document.getElementById(selectId);
            if (selectElement) {
                selectElement.value = incentiveLevels[incentiveName];
            }
        }
    } else {
        // 保存されたレベルがない場合、initializeIncentiveSettingsで設定されたデフォルト値が使用されるため、
        // ここでは特に何もしなくても良い。
    }
    calculateTotalPoints(); // 読み込み後に合計ポイントを再計算
}
