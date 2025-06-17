let multipliersData = {}; // 全曜日の倍率データと単位情報を保持するオブジェクト
let unitFactors = {};     // 単位ごとの調整倍率を保持するオブジェクト

/**
 * 倍率データをJSONファイルから非同期で読み込む関数
 */
async function loadMultipliers() {
    try {
        const response = await fetch('multipliers.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        unitFactors = data.unit_factors; // 単位の調整倍率を保存
        delete data.unit_factors;          // multipliersDataからはunit_factorsを除外
        multipliersData = data;            // 残りのデータをmultipliersDataに保存

        console.log('倍率データを読み込みました:', multipliersData);
        console.log('単位調整倍率:', unitFactors);

        // 各曜日の入力フォームを動的に生成
        generateInputForms();

        // データを読み込んだ後に初期計算を実行し、最初のタブをアクティブにする
        const firstTabButton = document.querySelector('.tab-button.active');
        if (firstTabButton) {
            firstTabButton.click();
        } else {
            document.querySelector('.tab-button')?.click(); // activeがなければ最初のボタンをクリック
        }

    } catch (error) {
        console.error('倍率データの読み込み中にエラーが発生しました:', error);
        console.warn('デフォルトの倍率データを使用します。');
        // エラー発生時のフォールバックデータ
        unitFactors = {
            "none": 1.0,
            "K": 1000.0,
            "M": 1000000.0,
            "G": 1000000000.0,
            "minute": 1.0,
            "hour": 60.0,
            "day": 1440.0
        };
        multipliersData = {
            "monday": {
                "APを1消費する": { "multiplier": 375.0, "default_unit": "none" },
                "レーダークエストを1回クリアする": { "multiplier": 30000.0, "default_unit": "none" },
                "一度に英雄Expを660以上消費する": { "multiplier": 2.5, "default_unit": "M", "per_value": 660.0 },
                "ドローン戦闘データを1消費する": { "multiplier": 7.5, "default_unit": "K", "input_unit_type": "quantity" },
                "ドローンギアを1個消費する": { "multiplier": 6250.0, "default_unit": "none" },
                "食料を100採集する": { "multiplier": 50.0, "default_unit": "none" },
                "鋼材を100採集する": { "multiplier": 50.0, "default_unit": "none" },
                "金貨を100採集する": { "multiplier": 50.0, "default_unit": "none" },
                "チップ宝箱の開封でチップ材料(上級)を1点獲得": { "multiplier": 2812.5, "default_unit": "none" }
            },
            "tuesday": {
                "建造の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "施設建設で戦力を1獲得する": { "multiplier": 30.0, "default_unit": "none" },
                "UR貿易輸送車を1回発車する": { "multiplier": 300000.0, "default_unit": "none" },
                "UR極秘任務を1回遂行する": { "multiplier": 225000.0, "default_unit": "none" },
                "生存者募集を1回行う": { "multiplier": 4500.0, "default_unit": "none" }
            },
            "wednesday": {
                "科学研究の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "施設建設で戦力を1獲得する": { "multiplier": 30.0, "default_unit": "none" },
                "知恵の勲章を1枚消費する": { "multiplier": 750.0, "default_unit": "none" },
                "レーダークエストを1回クリアする": { "multiplier": 30000.0, "default_unit": "none" },
                "Lv.1ドローン宝箱を開ける": { "multiplier": 2750.0, "default_unit": "none" },
                "Lv.2ドローン宝箱を開ける": { "multiplier": 8250.0, "default_unit": "none" },
                "Lv.3ドローン宝箱を開ける": { "multiplier": 25000.0, "default_unit": "none" },
                "Lv.4ドローン宝箱を開ける": { "multiplier": 75000.0, "default_unit": "none" },
                "Lv.5ドローン宝箱を開ける": { "multiplier": 225000.0, "default_unit": "none" },
                "Lv.6ドローン宝箱を開ける": { "multiplier": 675000.0, "default_unit": "none" },
                "Lv.7ドローン宝箱を開ける": { "multiplier": 2025000.0, "default_unit": "none" }
            },
            "thursday": {
                "英雄を1回募集する": { "multiplier": 4500.0, "default_unit": "none" },
                "一度に英雄Expを660以上消費する": { "multiplier": 2.5, "default_unit": "M", "per_value": 660.0 },
                "UR英雄かけらを1枚消費する": { "multiplier": 25000.0, "default_unit": "none" },
                "SSR英雄かけらを1枚消費する": { "multiplier": 8750.0, "default_unit": "none" },
                "SR英雄かけらを1枚消費する": { "multiplier": 2500.0, "default_unit": "none" },
                "スキルメダルを1枚消費する": { "multiplier": 30.0, "default_unit": "K", "input_unit_type": "quantity" },
                "専用武装のかけらを1枚消費する": { "multiplier": 25000.0, "default_unit": "none" }
            },
            "friday": {
                "レーダークエストを1回クリアする": { "multiplier": 30000.0, "default_unit": "none" },
                "建造の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "施設建設で戦力を1獲得する": { "multiplier": 30.0, "default_unit": "none" },
                "科学研究の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "科学研究で戦力を1獲得する": { "multiplier": 30.0, "default_unit": "none" },
                "訓練の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "LV.1兵士を1人訓練する": { "multiplier": 60.0, "default_unit": "none" },
                "LV.2兵士を1人訓練する": { "multiplier": 90.0, "default_unit": "none" },
                "LV.3兵士を1人訓練する": { "multiplier": 120.0, "default_unit": "none" },
                "LV.4兵士を1人訓練する": { "multiplier": 150.0, "default_unit": "none" },
                "LV.5兵士を1人訓練する": { "multiplier": 180.0, "default_unit": "none" },
                "LV.6兵士を1人訓練する": { "multiplier": 210.0, "default_unit": "none" },
                "LV.7兵士を1人訓練する": { "multiplier": 240.0, "default_unit": "none" },
                "LV.8兵士を1人訓練する": { "multiplier": 270.0, "default_unit": "none" },
                "LV.9兵士を1人訓練する": { "multiplier": 300.0, "default_unit": "none" },
                "LV.10兵士を1人訓練する": { "multiplier": 330.0, "default_unit": "none" },
                "ドミネーターのかけらを1枚消費する": { "multiplier": 25000.0, "default_unit": "none" },
                "ドミネーターの訓練ノートを100個消費する": { "multiplier": 1562.5, "default_unit": "none", "per_value": 100.0 },
                "ドミネーターの訓練証明書を1枚消費する": { "multiplier": 3750.0, "default_unit": "none" },
                "ドミネーターの連携の証を1枚消費する": { "multiplier": 75000.0, "default_unit": "none" },
                "ドミネーターのスキルメダルを1枚消費する": { "multiplier": 12.5, "default_unit": "none" }
            },
            "saturday": {
                "UR貿易輸送車を1回発車する": { "multiplier": 300000.0, "default_unit": "none" },
                "UR極秘任務を1回遂行する": { "multiplier": 225000.0, "default_unit": "none" },
                "建造の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "科学研究の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "訓練の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "治療の残り時間を1分短縮する": { "multiplier": 150.0, "default_unit": "none", "input_unit_type": "time" },
                "相手連盟のLv.1兵士を1体撃破する": { "multiplier": 30.0, "default_unit": "none" },
                "相手連盟のLv.2兵士を1体撃破": { "multiplier": 45.0, "default_unit": "none" },
                "相手連盟のLv.3兵士を1体撃破する": { "multiplier": 60.0, "default_unit": "none" },
                "相手連盟のLv.4兵士を1体撃破する": { "multiplier": 75.0, "default_unit": "none" },
                "相手連盟のLv.5兵士を1体撃破する": { "multiplier": 90.0, "default_unit": "none" },
                "相手連盟のLv.6兵士を1体撃破する": { "multiplier": 105.0, "default_unit": "none" },
                "相手連盟のLv.7兵士を1体撃破する": { "multiplier": 120.0, "default_unit": "none" },
                "相手連盟のLv.8兵士を1体撃破する": { "multiplier": 135.0, "default_unit": "none" },
                "相手連盟のLv.9兵士を1体撃破する": { "multiplier": 150.0, "default_unit": "none" },
                "相手連盟のLv.10兵士を1体撃破する": { "multiplier": 165.0, "default_unit": "none" },
                "Lv.1兵士を1体撃破する": { "multiplier": 6.0, "default_unit": "none" },
                "Lv.2兵士を1体撃破する": { "multiplier": 9.0, "default_unit": "none" },
                "Lv.3兵士を1体撃破する": { "multiplier": 12.0, "default_unit": "none" },
                "Lv.4兵士を1体撃破する": { "multiplier": 15.0, "default_unit": "none" },
                "Lv.5兵士を1体撃破する": { "multiplier": 18.0, "default_unit": "none" },
                "Lv.6兵士を1体撃破する": { "multiplier": 21.0, "default_unit": "none" },
                "v.7兵士を1体撃破する": { "multiplier": 24.0, "default_unit": "none" },
                "Lv.8兵士を1体撃破する": { "multiplier": 27.0, "default_unit": "none" },
                "Lv.9兵士を1体撃破する": { "multiplier": 30.0, "default_unit": "none" },
                "Lv.10兵士を1体撃破する": { "multiplier": 33.0, "default_unit": "none" },
                "Lv.1兵士を1体撃破される": { "multiplier": 5.0, "default_unit": "none" },
                "Lv.2兵士を1体撃破される": { "multiplier": 7.5, "default_unit": "none" },
                "Lv.3兵士を1体撃破される": { "multiplier": 10.0, "default_unit": "none" },
                "Lv.4兵士を1体撃破される": { "multiplier": 12.5, "default_unit": "none" },
                "Lv.5兵士を1体撃破される": { "multiplier": 15.0, "default_unit": "none" },
                "Lv.6兵士を1体撃破される": { "multiplier": 17.5, "default_unit": "none" },
                "v.7兵士を1体撃破される": { "multiplier": 20.0, "default_unit": "none" },
                "Lv.8兵士を1体撃破される": { "multiplier": 22.5, "default_unit": "none" },
                "Lv.9兵士を1体撃破される": { "multiplier": 25.0, "default_unit": "none" },
                "Lv.10兵士を1体撃破される": { "multiplier": 27.5, "default_unit": "none" }
            }
        };
        generateInputForms();
        const firstTabButton = document.querySelector('.tab-button.active');
        if (firstTabButton) {
            firstTabButton.click();
        } else {
            document.querySelector('.tab-button')?.click();
        }
    }
}

/**
 * multipliersDataを元に、各曜日の入力フォームを動的に生成する関数
 */
function generateInputForms() {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    days.forEach(day => {
        const inputContainer = document.getElementById(`inputContainer_${day}`);
        if (!inputContainer) return;

        inputContainer.innerHTML = ''; // 既存の内容をクリア

        const dayItems = multipliersData[day]; // その曜日の項目データ
        if (!dayItems) return;

        for (const itemKey in dayItems) {
            const itemData = dayItems[itemKey];
            
            // multiplier-display の表示値は、JSONのmultiplier値をそのまま表示します。
            // default_unitがKやMであっても、表示は小数点以下1桁まででそのままにします。
            const displayMultiplier = itemData.multiplier.toFixed(1); 
            
            // 単位は括弧内に表示しない
            const displayMultiplierUnit = ''; 
            const multiplierDisplayContent = `(+<span id="multiplier${itemKey}_${day}">${displayMultiplier}${displayMultiplierUnit}</span>)`;
            
            // 入力値の単位選択ドロップダウン
            let unitSelectHtml = '';
            let unitOptionsToDisplay = [];

            if (itemData.input_unit_type === "time") {
                unitOptionsToDisplay = ['minute', 'hour', 'day'].filter(unit => unitFactors.hasOwnProperty(unit));
            } else if (itemData.per_value || itemData.input_unit_type === "quantity") {
                unitOptionsToDisplay = ['K', 'M', 'G'].filter(unit => unitFactors.hasOwnProperty(unit));
            }

            if (unitOptionsToDisplay.length > 0) {
                let unitSelectOptions = '';
                unitOptionsToDisplay.forEach(unit => {
                    let displayUnitName;
                    switch (unit) {
                        case 'minute': displayUnitName = '分'; break;
                        case 'hour': displayUnitName = '時間'; break;
                        case 'day': displayUnitName = '日'; break;
                        default: displayUnitName = unit.toUpperCase(); break; // K, M, Gはそのまま
                    }
                    unitSelectOptions += `<option value="${unit}">${displayUnitName}</option>`;
                });
                unitSelectHtml = `
                    <select id="unitInputSelect_${itemKey}_${day}" class="unit-select">
                        ${unitSelectOptions}
                    </select>
                `;
            }

            const labelText = itemKey;

            const inputGroup = document.createElement('div');
            inputGroup.classList.add('input-group');

            inputGroup.innerHTML = `
                <label for="input${itemKey}_${day}">${labelText}:</label>
                <input type="number" id="input${itemKey}_${day}" value="" placeholder="数字を入力">
                ${unitSelectHtml}
                <span class="multiplier-display">${multiplierDisplayContent}</span>
            `;
            inputContainer.appendChild(inputGroup);

            // ドロップダウンのデフォルト値とイベントリスナーを設定 (プルダウンが存在する場合のみ)
            const unitInputSelect = document.getElementById(`unitInputSelect_${itemKey}_${day}`);
            if (unitInputSelect) {
                // ローカルストレージからの単位選択状態の復元
                const storedUnit = localStorage.getItem(`unit_input_${itemKey}_${day}`);
                if (storedUnit !== null) {
                    unitInputSelect.value = storedUnit;
                } else {
                    // デフォルト単位の設定ロジック
                    if (itemData.input_unit_type === "time") {
                        unitInputSelect.value = 'minute';
                    } else if (itemData.per_value || itemData.input_unit_type === "quantity") {
                        unitInputSelect.value = 'K';
                    } else {
                        unitInputSelect.value = 'none';
                    }
                }
                // 単位が変更されたら再計算 (と単位選択の保存)
                unitInputSelect.addEventListener('change', () => calculateTotal(day));
            }
            
            // 入力フィールドの変更時にも再計算 (入力値は保存しない)
            const inputElement = document.getElementById(`input${itemKey}_${day}`);
            if (inputElement) {
                inputElement.addEventListener('input', () => calculateTotal(day));
            }
        }
    });
}

/**
 * 曜日タブを切り替える関数
 * @param {Event} evt - クリックイベント
 * @param {string} tabName - 表示するタブのID (例: 'monday')
 */
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }

    tablinks = document.getElementsByClassName("tab-button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");

    // タブ切り替え時に単位選択状態を復元し、計算
    restoreUnitSelectionsAndCalculateTotal(tabName);
}

/**
 * 指定された曜日の単位選択をlocalStorageから復元し、合計を計算し、表示を更新する関数
 * @param {string} day - 処理対象の曜日 (例: 'monday')
 */
function restoreUnitSelectionsAndCalculateTotal(day) {
    const dayItems = multipliersData[day];
    if (!dayItems) return;

    for (const itemKey in dayItems) {
        const itemData = dayItems[itemKey]; 

        // 入力値は復元しないので、常に空にする
        const inputElement = document.getElementById(`input${itemKey}_${day}`);
        if (inputElement) {
            inputElement.value = ''; 
        }

        // 入力単位選択状態の復元 (プルダウンが存在する場合のみ)
        const unitInputSelect = document.getElementById(`unitInputSelect_${itemKey}_${day}`);
        if (unitInputSelect) {
            const storedInputUnit = localStorage.getItem(`unit_input_${itemKey}_${day}`);
            if (storedInputUnit !== null) {
                unitInputSelect.value = storedInputUnit;
            } else {
                // デフォルト単位の設定ロジック
                if (itemData.input_unit_type === "time") {
                    unitInputSelect.value = 'minute';
                } else if (itemData.per_value || itemData.input_unit_type === "quantity") {
                    unitInputSelect.value = 'K';
                } else {
                    unitInputSelect.value = 'none';
                }
            }
        }
    }
    // 復元された単位選択で合計を計算
    calculateTotal(day);
}

/**
 * 指定された曜日の合計を計算し、表示を更新する関数
 * この関数は入力値をlocalStorageに保存しないが、単位選択は保存する。
 * @param {string} day - 計算対象の曜日 (例: 'monday')
 */
function calculateTotal(day) {
    let total = 0;
    const dayItems = multipliersData[day];

    if (!dayItems) {
        document.getElementById(`total_${day}`).textContent = '0.0';
        return;
    }

    for (const itemKey in dayItems) {
        const itemData = dayItems[itemKey];
        const baseMultiplier = itemData.multiplier; 
        const perValue = itemData.per_value || 1.0; 

        const inputElement = document.getElementById(`input${itemKey}_${day}`);
        const unitInputSelect = document.getElementById(`unitInputSelect_${itemKey}_${day}`);

        if (inputElement) {
            const inputValue = parseFloat(inputElement.value) || 0;
            
            let inputUnitFactor = 1.0; 
            let currentInputUnit = 'none'; 

            if (unitInputSelect) {
                currentInputUnit = unitInputSelect.value;
                inputUnitFactor = unitFactors[currentInputUnit] || 1.0;
                localStorage.setItem(`unit_input_${itemKey}_${day}`, currentInputUnit);
            }
            
            total += ((inputValue * inputUnitFactor) / perValue) * baseMultiplier;
        }
    }
    // 合計を整数に切り上げ、ローカライズされた文字列で表示
    document.getElementById(`total_${day}`).textContent = Math.ceil(total).toLocaleString();
}

/**
 * ページロード時に実行される初期化処理
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadMultipliers();
});
