import React, {useEffect, useState, useRef} from 'react'
import { supabase } from './lib/helper/supabase_client'

export default function App() {

  const inputRef = useRef();
  //const [email, setEmail] = useState('');
  //const [password, setPassword] = useState('');
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);  
  const [error, setError] = useState(null);
  const [todo, setTodo] = useState([]);

    const login = async () => {

      try {
        const { data, error } =await supabase.auth.signInWithOAuth({
          provider: "github",
        });

       
        if (error) {
          console.error('Error signing in:', error.message);
        } else {
          console.log('User signed in:', data);
        }

      } catch (error) {
        console.error('Error during sign in:', error);
      }

    }

    useEffect(() => {
      async function fetchSession() {

        getTodo();
        console.log("useEffect");

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session:', error);
        } else {
          setSession(session);
          setUser(session?.user);

          const {data: authListioner} = supabase.auth.onAuthStateChange(
            (event, session) => {
              switch(event){
                case "SIGNED_IN":                
                  setUser(session?.user);
                  break;
                case "SIGNED_OUT":
                  setUser(null);
                    break;
                default:
                    break;
              }
            }
          );

          return () => {
            authListioner.unsubscribe();
          }
        }
      }  
      fetchSession();
    }, []);

    const logout = async () => {
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error during sign up:', error);
      }
    }   

    const handleCreateTody = async () => {
      const title = inputRef.current.value;
      const response = await supabase.from('todo').insert({title:title, user_id: user.id}).select("*").single();
      
      setError(response?.error);
      
      if(response.data){
        setTodo((currentTodo) => [...currentTodo, response.data]);
      }
    }

    const getTodo = async () => {
      const response = await supabase.from("todo").select("*");

      setError(response?.error);
      setTodo(response?.data);
      console.log(response);
    }

    const handleUpdate = async (id) => {
      const response = await supabase.from("todo").update({complete:true}).eq("id",id).select("*").single();      
      setError(response?.error);

      if(!response.error){
        setTodo((currentTodo) => currentTodo.map((todo) => {
          if(todo.id === id){
              todo.complete = true;
          }
          return todo;
        }))
      }
    }

    const handleDelete = async (id) =>{
      const response = await supabase.from("todo").delete().eq("id",id).select("*").single();

      console.log(response.data);

      if(!response.error){
        if(!response.error){
          setTodo((currentTodo) => currentTodo.filter((todo) => todo.id !== id));
        }else{
          console.log(response.error);
        }
      }
    }

    return (
      <div>
        <div>
          <h1>React Supabase database</h1>
          {user? (
              <div>
                <div>
                  <input ref={inputRef} maxLength="10" style={{marginRight: 5}} />
                  <button onClick={handleCreateTody} > add</button>
                  {error && <pre>error.message</pre>}
                </div>

                <table>
                  <tbody>
                    {todo && 
                      todo.map(
                        (value, index) => {
                          const text_color = value.complete === true ? 'green' : 'none';
                          const status_text= value.complete === true ? 'Completed' : 'Complete';
                          return (
                            <tr key={index}>
                                <td style={{color:text_color}}>{value.title}</td>
                                <td><button onClick={()=>handleUpdate(value.id)}>{status_text}</button></td>
                                <td><button onClick={()=>handleDelete(value.id)}>Delete</button></td>
                            </tr>
                          );
                        }
                      )
                    }
                  </tbody>
                 </table>
              </div>
          ):(
            <div></div>
          )
        }          
        </div>
        
        <div>
        <br />
          {user ? 
            (
              <button onClick={logout} >Logout</button>
            ):(
              <button onClick={login} >Login</button>
            )
          }
        </div>
      </div>
    )  
  }
