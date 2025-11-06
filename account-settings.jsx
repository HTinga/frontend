<div className="p-8">
  <h2 className="text-2xl font-bold">My Account</h2>
  <form>
    <input type="text" value={user.name} disabled className="p-2 border rounded" />
    <input type="email" value={user.email} disabled className="p-2 border rounded" />
  </form>
  <h2 className="text-2xl font-bold mt-4">Plan Details</h2>
  <p>Plan: {accountDetails.plan}</p>
  <p>Balance: KSh {accountDetails.balance}</p>
  <h2 className="text-2xl font-bold mt-4">Notification Preferences</h2>
  <label>
    <input type="checkbox" /> Email Notifications
  </label>
</div>