class DATA_SORT {
	constructor(sSortKey = null, sDirection = "ascending", sDataType = "alpha") {
		if( !(Array.isArray(sDataType)) ){
			sDataType = [sDataType];
		}
		if( !(Array.isArray(sSortKey)) ){
			sSortKey = [sSortKey];
		}
		if( !(Array.isArray(sDirection)) ){
			sDirection = [sDirection];
		}
		this.sSortKey = sSortKey;
		this.sDirection = sDirection;
		this.sDataType = sDataType;
	}

	get sortCriteria(){
		return { 
			'sortKey':this.sSortKey,
			'direction':this.sDirection,
			'dataType':this.sDataType
		}
	}

	set sortCriteria(oSortParams){
		if(oSortParams){
			if(oSortParams.sortKey){
			this.sSortKey = oSortParams.sortKey;
			}
			if(oSortParams.direction){
				this.sDirection = oSortParams.direction;
			}
			if(oSortParams.dataType){
				this.sDataType = oSortParams.dataType;
			}	
		}		
	}

	sort(aData){
		if(!aData || !this.sSortKey){
			return;
		}

		aData.sort((a, b) =>{
            let keyA = null;
            let keyB = null;

			for(let i = 0;i<this.sSortKey.length;i++){
				if(this.sSortKey[i].indexOf('.') == -1){
					keyA = a[this.sSortKey[i]];
					keyB = b[this.sSortKey[i]];    
				}
				else{
					keyA = this.sSortKey[i].split('.').reduce((o, i)=>o[i],a);
					keyB = this.sSortKey[i].split('.').reduce((o, i)=>o[i],b);
				}
				
				let nDirMod = 1;
				
				if(this.sDirection[i] == "descending"){
					nDirMod = -1;
				}
				
				switch(this.sDataType[i]){
					case "date":
						keyA = Date.parse(keyA);
						keyB = Date.parse(keyB);
						break;
					case "currency":
						keyA = typeof keyA === "string" ? +(keyA.replace(",","")) : keyA;
						keyB = typeof keyB === "string" ? +(keyB.replace(",","")) : keyB;
						break;
					case "numeric":
						keyA = +(keyA);
						keyB = +(keyB);
						break;
					default:

				}

				if(keyA > keyB){
					return 1 * nDirMod;
				}
				if(keyA < keyB){
					return -1 * nDirMod
				}            
			}
			return 0;
        });

		return aData;
	}

}