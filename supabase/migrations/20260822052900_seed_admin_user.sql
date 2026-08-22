insert into public.admin_users (user_id)
values ('6392ff67-a3a8-47dc-aa37-7721ded09315')
on conflict (user_id) do nothing;
