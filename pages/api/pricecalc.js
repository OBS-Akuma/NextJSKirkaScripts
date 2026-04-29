// /pages/api/pricecalc.js
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'erm no you cant do that meow' });
  }
  
  const { price } = req.query;
  
  if (!price) {
    return res.status(400).json({ 
      error: 'Missing price parameter dumbass',
      usage: '/api/pricecalc?price=skin1,skin2,skin3'
    });
  }
  
  try {

    const response = await fetch('https://opensheet.elk.sh/1pxMSoaSo8FYv-OIJ26HpSj8EDy7EDRmatHyQW24o6E4/Sorted+View');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch skin data: ${response.status}`);
    }
    
    const skinData = await response.json();
    
    const skinMap = new Map();
    skinData.forEach(skin => {
      skinMap.set(skin['Skin Name'].toLowerCase(), skin);
    });
    
    const skinNames = price.split(',').map(name => name.trim());
    
    const breakdown = {};
    let totalValue = 0;
    
    for (const skinName of skinNames) {
      const skin = skinMap.get(skinName.toLowerCase());
      
      if (skin) {

        const baseValueStr = skin['Base Value'].toString().replace(/,/g, '');
        let baseValue = parseFloat(baseValueStr);
      
        if (isNaN(baseValue)) {
          baseValue = 0;
        }
        
        breakdown[skin['Skin Name']] = baseValue;
        totalValue += baseValue;
      } else {
        breakdown[skinName] = 0;
      }
    }
    

    return res.status(200).json({
      value: totalValue,
      breakdown: breakdown
    });
    
  } catch (error) {
    console.error('Price calculation error wowza:', error);
    return res.status(500).json({
      value: 0,
      breakdown: {},
      error: 'Failed to calculate prices How sad'
    });
  }
}
