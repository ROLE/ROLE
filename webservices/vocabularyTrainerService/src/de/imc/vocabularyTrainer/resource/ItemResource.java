package de.imc.vocabularyTrainer.resource;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.representation.Representation;
import org.restlet.resource.Delete;
import org.restlet.resource.Post;
import org.restlet.resource.ResourceException;

import de.imc.vocabularyTrainer.VItem;

public class ItemResource extends BaseResource{

	int listId;
	int itemId;
	
	@Override  
	protected void doInit() throws ResourceException {  
			
		String listIdString = (String) getRequest().getAttributes().get("listId");
		if(listIdString != null){
			listId = Integer.valueOf(listIdString);
		}
		
		String itemIdString = (String) getRequest().getAttributes().get("itemId");
		if(itemIdString != null){
			itemId = Integer.valueOf(itemIdString);
		}
	
	}
		
	/**
	 * Handle POST requests: create a new item.
	 * @throws JSONException 
	 */
	@Post
	public Representation acceptItem(Representation entity){
		
		Representation result = null;
		
		JsonRepresentation represent;
		try {
			represent = new JsonRepresentation(entity);
			JSONObject jsonobject = represent.toJsonObject();
			VItem item = new VItem(jsonobject);
	        
			super.getDBWrapper().createItem(item, listId);
			
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			result =  generateErrorRepresentation("IOException","");
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			result =  generateErrorRepresentation("JSONException","");
		}
        
		result =  generateSuccessRepresentation("Item created");
	
		return result;
	}
	
	
	/** 
      * Handle DELETE requests. 
      */  
     @Delete  
     public Representation removeItem() {  
    	 Representation result = null;
    	 
    	 super.getDBWrapper().deleteItem(itemId);
    	 
    	 result =  generateSuccessRepresentation("Item deleted");
    	 
    	 return result;
     } 	
}